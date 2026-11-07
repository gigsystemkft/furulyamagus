import React, { useState, useEffect } from 'react';
import { RECORDER_NOTES } from '../data/notes';
import { NoteInfo, UserProfile } from '../types';
import { audioManager } from '../utils/audio';
import { Mic, Sparkles, Volume2, Award, CheckCircle } from 'lucide-react';

interface PracticeViewProps {
  profile: UserProfile;
  updateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  isMicActive: boolean;
  toggleMic: () => void;
  detectedNote: NoteInfo | null;
  detectedFreq: number;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  profile,
  updateProfile,
  isMicActive,
  toggleMic,
  detectedNote,
  detectedFreq,
}) => {
  const [targetNoteIndex, setTargetNoteIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const targetNote = RECORDER_NOTES[targetNoteIndex];

  // Check if detected note matches target note
  useEffect(() => {
    if (detectedNote && detectedNote.id === targetNote.id && !celebrate) {
      triggerSuccess();
    }
  }, [detectedNote, targetNote]);

  const triggerSuccess = () => {
    setCelebrate(true);
    audioManager.playSuccessSound();

    updateProfile((prev) => {
      const newCoins = prev.coins + 5;
      const newXp = prev.xp + 15;
      let newLevel = prev.level;
      if (newXp >= newLevel * 100) {
        newLevel += 1;
      }

      // Update achievements
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'practice_notes') {
          const newProg = Math.min(ach.maxProgress, ach.progress + 1);
          return { ...ach, progress: newProg, unlocked: newProg >= ach.maxProgress ? true : ach.unlocked };
        }
        return ach;
      });

      return {
        ...prev,
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        achievements: updatedAchievements,
      };
    });

    setSuccessCount((c) => c + 1);

    setTimeout(() => {
      setCelebrate(false);
      setTargetNoteIndex((idx) => (idx + 1) % RECORDER_NOTES.length);
    }, 1500);
  };

  const handleTestCorrect = () => {
    triggerSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/25 px-3 py-1 rounded-full text-yellow-300 text-xs font-bold mb-2">
            <Mic className="w-4 h-4 animate-pulse" /> Mikrofonos Gyakorló
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Fújd be a megadott hangot!</h2>
          <p className="text-emerald-100 text-sm mt-1">Játszd el a furulyádon a képen látható hangot. A mikrofon azonnal figyeli!</p>
        </div>
        <div className="hidden md:block text-5xl">🎙️🎶</div>
      </div>

      {!isMicActive && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h4 className="font-extrabold text-amber-900">A mikrofon jelenleg ki van kapcsolva!</h4>
              <p className="text-amber-800 text-xs">Kattints a gombra a hangfelismerés bekapcsolásához, vagy tesztelhetsz kattintással is.</p>
            </div>
          </div>
          <button
            onClick={toggleMic}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-2xl text-xs shadow transition-all whitespace-nowrap"
          >
            Mikrofon BE
          </button>
        </div>
      )}

      {/* Target Note Display Card */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100 text-center space-y-6 relative overflow-hidden">
        {celebrate && (
          <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white animate-fade-in">
            <Sparkles className="w-16 h-16 text-yellow-300 animate-bounce mb-2" />
            <h3 className="text-3xl font-black">Szép volt! 🎉</h3>
            <p className="text-emerald-100 font-bold mt-1">+5 Arany, +15 XP</p>
          </div>
        )}

        <div>
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Keresett hang:</span>
          <div className="text-6xl md:text-7xl font-black text-gray-800 my-2">{targetNote.name}</div>
          <div className="text-xl font-bold text-emerald-600">{targetNote.solfege}</div>
        </div>

        {/* Fingering hint */}
        <div className="max-w-md mx-auto bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-left">
          <h4 className="font-extrabold text-emerald-900 text-sm mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Súgó a fogáshoz:
          </h4>
          <p className="text-emerald-800 text-sm">{targetNote.description}</p>
        </div>

        {/* Live Pitch Feedback Meter */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 max-w-lg mx-auto space-y-3">
          <div className="flex justify-between text-xs font-bold text-gray-500">
            <span>Érzékelt frekvencia:</span>
            <span className="text-indigo-600 font-mono">{detectedFreq > 0 ? `${Math.round(detectedFreq)} Hz` : 'Csend'}</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-extrabold text-sm transition-all ${
              !isMicActive
                ? 'bg-gray-200 text-gray-500'
                : detectedNote
                ? detectedNote.id === targetNote.id
                  ? 'bg-emerald-500 text-white animate-bounce scale-105'
                  : 'bg-amber-400 text-amber-900'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {!isMicActive
                ? 'Mikrofon Ki'
                : detectedNote
                ? detectedNote.id === targetNote.id
                  ? '🎯 TÖKÉLETES! Helyes hang!'
                  : `Hallható hang: ${detectedNote.name} (Célozd meg: ${targetNote.name})`
                : '🎵 Fújj a furulyába...'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => audioManager.playNoteTone(targetNote.freq)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <Volume2 className="w-5 h-5" /> Hang meghallgatása
          </button>

          <button
            onClick={handleTestCorrect}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105"
            title="Kattints ide teszteléshez, ha nincs nálad a furulya"
          >
            <Sparkles className="w-5 h-5" /> Teszt (Kihagyás)
          </button>
        </div>

        <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
          <span>Sikeres gyakorlások: <strong className="text-emerald-600">{successCount}</strong></span>
          <span>Szint: <strong className="text-purple-600">{profile.level}</strong></span>
        </div>
      </div>
    </div>
  );
};
