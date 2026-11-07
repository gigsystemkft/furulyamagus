import React, { useState, useEffect, useRef } from 'react';
import { NoteInfo, UserProfile, BalloonSkin } from '../types';
import { RECORDER_NOTES, INITIAL_BALLOON_SKINS } from '../data/notes';
import { audioManager } from '../utils/audio';
import { Gamepad2, Coins, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

interface GameViewProps {
  profile: UserProfile;
  updateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  isMicActive: boolean;
  toggleMic: () => void;
  detectedNote: NoteInfo | null;
}

interface ActiveBalloon {
  id: string;
  note: NoteInfo;
  x: number; // percentage from left (100 = right edge, 0 = left edge)
  y: number; // percentage from top
  speed: number; // speed per frame
  skin: BalloonSkin;
}

export const GameView: React.FC<GameViewProps> = ({
  profile,
  updateProfile,
  isMicActive,
  toggleMic,
  detectedNote,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<ActiveBalloon[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [, setLastPopped] = useState<string | null>(null);

  const requestRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);

  const activeSkin = INITIAL_BALLOON_SKINS.find((s) => s.id === profile.activeSkin) || INITIAL_BALLOON_SKINS[0];
  const unlockedSkinsList = INITIAL_BALLOON_SKINS.filter((s) => profile.unlockedSkins.includes(s.id));

  // Start / Reset Game
  const startGame = () => {
    setScore(0);
    setLives(3);
    setBalloons([]);
    setGameOver(false);
    setIsPlaying(true);
    lastSpawnTimeRef.current = performance.now();
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = (time: number) => {
      // Spawn balloon every 2.4 seconds (gets faster with score)
      const spawnInterval = Math.max(900, 2400 - score * 50);
      if (time - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = time;
        spawnRandomBalloon();
      }

      // Move balloons from right to left
      setBalloons((prev) => {
        const nextBalloons: ActiveBalloon[] = [];
        let missedCount = 0;

        for (const b of prev) {
          const nextX = b.x - b.speed;
          if (nextX < 5) {
            // Reached left edge -> lose life
            missedCount++;
          } else {
            nextBalloons.push({ ...b, x: nextX });
          }
        }

        if (missedCount > 0) {
          setLives((l) => {
            const newL = l - missedCount;
            if (newL <= 0) {
              setGameOver(true);
              setIsPlaying(false);
            }
            return newL;
          });
        }

        return nextBalloons;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, score]);

  // Progressive Note Pool based on score stages
  const getNotePoolForScore = (currentScore: number): NoteInfo[] => {
    let noteIds: string[] = [];

    if (currentScore < 5) {
      // Stage 1: A', G', F'
      noteIds = ['A4', 'G4', 'F4'];
    } else if (currentScore < 10) {
      // Stage 2: A', G', F', E', H'
      noteIds = ['A4', 'G4', 'F4', 'E4', 'B4'];
    } else if (currentScore < 15) {
      // Stage 3: A', G', F', H', C"
      noteIds = ['A4', 'G4', 'F4', 'B4', 'C5'];
    } else if (currentScore < 20) {
      // Stage 4: A', G', F', E', D'
      noteIds = ['A4', 'G4', 'F4', 'E4', 'D4'];
    } else if (currentScore < 25) {
      // Stage 5: A', G', F', E', D', H', C', C"
      noteIds = ['A4', 'G4', 'F4', 'E4', 'D4', 'B4', 'C4', 'C5'];
    } else if (currentScore < 30) {
      // Stage 6: A', G', Fisz'
      noteIds = ['A4', 'G4', 'FISZ4'];
    } else if (currentScore < 35) {
      // Stage 7: A', G', Fisz', E', C', C", B'
      noteIds = ['A4', 'G4', 'FISZ4', 'E4', 'C4', 'C5', 'BETA4'];
    } else {
      // Stage 8: All notes randomized
      return RECORDER_NOTES;
    }

    return RECORDER_NOTES.filter((n) => noteIds.includes(n.id));
  };

  const spawnRandomBalloon = () => {
    const currentPool = getNotePoolForScore(score);
    const randomNote = currentPool[Math.floor(Math.random() * currentPool.length)];
    const randomSkin = unlockedSkinsList[Math.floor(Math.random() * unlockedSkinsList.length)] || activeSkin;
    const randomY = Math.floor(Math.random() * 30) + 25; // 25% to 55% from top
    const speed = 0.25 + score * 0.015; // gets faster with score

    const newBalloon: ActiveBalloon = {
      id: Math.random().toString(36).substring(2, 9),
      note: randomNote,
      x: 95, // start near right edge
      y: randomY,
      speed,
      skin: randomSkin,
    };

    setBalloons((prev) => [...prev, newBalloon]);
  };

  // Check detected note against active balloons
  useEffect(() => {
    if (!isPlaying || gameOver || !detectedNote) return;

    // Find balloon matching detected note
    const matchedIndex = balloons.findIndex((b) => b.note.id === detectedNote.id);
    if (matchedIndex !== -1) {
      popBalloon(balloons[matchedIndex].id);
    }
  }, [detectedNote, balloons, isPlaying, gameOver]);

  const popBalloon = (balloonId: string) => {
    audioManager.playPopSound();
    audioManager.playCoinSound();

    setBalloons((prev) => prev.filter((b) => b.id !== balloonId));
    setScore((s) => s + 1);
    setLastPopped(balloonId);

    // Update profile coins, XP, and achievements
    updateProfile((prev) => {
      const newCoins = prev.coins + 2;
      const newXp = prev.xp + 10;
      let newLevel = prev.level;
      if (newXp >= newLevel * 100) {
        newLevel += 1;
      }

      const newTotalPopped = prev.totalBalloonsPopped + 1;

      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'first_pop' || ach.id === 'balloon_master_10') {
          const newProg = Math.min(ach.maxProgress, ach.progress + 1);
          return { ...ach, progress: newProg, unlocked: newProg >= ach.maxProgress ? true : ach.unlocked };
        }
        if (ach.id === 'coin_collector') {
          const newProg = Math.min(ach.maxProgress, prev.coins + 2);
          return { ...ach, progress: newProg, unlocked: newProg >= ach.maxProgress ? true : ach.unlocked };
        }
        return ach;
      });

      return {
        ...prev,
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        totalBalloonsPopped: newTotalPopped,
        achievements: updatedAchievements,
      };
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/25 px-3 py-1 rounded-full text-yellow-300 text-xs font-bold mb-2">
            <Gamepad2 className="w-4 h-4 animate-bounce" /> Lufi Pukkasztó Mágus Játék
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Fújd le a lufikat a furulyáddal!</h2>
          <p className="text-purple-100 text-sm mt-1">A jobb oldalról érkező lufikon lévő hangot játssz be a mikrofonba, hogy kipukkaszd!</p>
        </div>
        <div className="hidden md:block text-5xl">🎈🎯</div>
      </div>

      {!isMicActive && isPlaying && (
        <div className="bg-amber-50 border border-amber-300 px-4 py-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>A mikrofon ki van kapcsolva. Rákattinthatsz a lufikra is a pukkasztáshoz, vagy kapcsold be a mikrofont!</span>
          </div>
          <button
            onClick={toggleMic}
            className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-xl text-xs"
          >
            Mikrofon BE
          </button>
        </div>
      )}

      {/* Game Arena / Canvas Wrapper */}
      <div className="bg-gradient-to-b from-sky-400 via-indigo-900 to-purple-950 rounded-3xl h-[460px] relative overflow-hidden shadow-2xl border-4 border-purple-300/40 flex flex-col justify-between p-6">
        {/* Top Status Bar in Game */}
        <div className="flex items-center justify-between z-20 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-black text-yellow-300">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Pontszám: {score}</span>
            </div>
            <div className="flex items-center gap-1.5 font-black text-emerald-300">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span>Arany: +{score * 2}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-300">Életek:</span>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-30'}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>

        {/* Start / Game Over Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-4xl font-black text-white">
                {gameOver ? 'Játék Vége! 🎈💥' : 'Lufi Pukkasztó'}
              </h3>
              <p className="text-gray-300 text-sm max-w-md">
                {gameOver
                  ? `Ügyes voltál! Összesen ${score} lufit pukkasztottál ki és gyűjtöttél ${score * 2} aranyat!`
                  : 'Készülj fel! A lufik fokozatosan újabb hangokkal és egyre gyorsabban érkeznek.'}
              </p>
            </div>

            {gameOver && (
              <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 flex gap-6 text-white font-bold">
                <div>Elért pont: <span className="text-yellow-300">{score}</span></div>
                <div>Aranyjutalom: <span className="text-emerald-400">+{score * 2}</span></div>
              </div>
            )}

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-purple-950 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all text-lg flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5 animate-spin" />
              {gameOver ? 'Új Játék Indítása' : 'Játék Indítása! 🚀'}
            </button>
          </div>
        )}

        {/* Floating Glossy 3D Balloons in Playfield */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-auto">
            {balloons.map((b) => (
              <div
                key={b.id}
                onClick={() => popBalloon(b.id)}
                className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-115 group select-none animate-bounce"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDuration: '3s',
                }}
              >
                {/* Glossy 3D Balloon Bubble */}
                <div
                  className={`w-24 h-28 rounded-full bg-gradient-to-br ${b.skin.gradient} shadow-2xl flex flex-col items-center justify-center border-2 border-white/70 relative ring-4 ring-black/10`}
                  style={{
                    boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.3), 0 10px 25px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Glossy specular reflection highlight */}
                  <div className="absolute top-3 left-4 w-6 h-9 bg-white/60 rounded-full rotate-[-30deg] blur-[0.5px]" />
                  <div className="absolute top-2 left-10 w-2.5 h-3.5 bg-white/40 rounded-full rotate-[-30deg]" />

                  <span className="text-4xl mb-1 filter drop-shadow-md">{b.skin.icon}</span>
                  <span className="bg-black/60 backdrop-blur-sm text-yellow-300 px-4 py-1 rounded-full font-black text-2xl shadow-lg border border-yellow-400/40">
                    {b.note.name}
                  </span>
                </div>

                {/* Balloon Knot & String */}
                <div className="w-3 h-3 bg-white/90 rounded-b-md -mt-1 shadow-sm border border-black/20" />
                <div className="w-0.5 h-10 bg-white/75" />
              </div>
            ))}
          </div>
        )}

        {/* Bottom footer bar in game */}
        <div className="flex items-center justify-between z-20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl text-xs text-purple-200">
          <span>Aktív skin: <strong className="text-yellow-300">{activeSkin.name} {activeSkin.icon}</strong></span>
          <span>Tipp: A lufik nehézsége fokozatosan bővül új hangokkal!</span>
        </div>
      </div>
    </div>
  );
};
