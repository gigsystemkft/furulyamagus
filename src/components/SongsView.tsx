import React, { useState, useEffect } from 'react';
import { Song, UserProfile, NoteInfo } from '../types';
import { SONGS_DATABASE, RECORDER_NOTES } from '../data/notes';
import { audioManager } from '../utils/audio';
import { Music2, Play, Sparkles, CheckCircle2, Award, ArrowRight } from 'lucide-react';

interface SongsViewProps {
  profile: UserProfile;
  updateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  detectedNote: NoteInfo | null;
}

export const SongsView: React.FC<SongsViewProps> = ({ profile, updateProfile, detectedNote }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [songCompleted, setSongCompleted] = useState(false);

  const songNotes = selectedSong ? selectedSong.notes : [];
  const currentTargetNoteId = songNotes[currentNoteIndex];
  const targetNoteObj = RECORDER_NOTES.find((n) => n.id === currentTargetNoteId);

  // Check detected note against current song note in sequence
  useEffect(() => {
    if (!selectedSong || songCompleted || !detectedNote || !targetNoteObj) return;

    if (detectedNote.id === targetNoteObj.id) {
      audioManager.playCoinSound();
      const nextIdx = currentNoteIndex + 1;
      if (nextIdx >= songNotes.length) {
        // Song completed!
        setSongCompleted(true);
        audioManager.playSuccessSound();

        updateProfile((prev) => {
          const newCoins = prev.coins + 30;
          const newXp = prev.xp + 50;
          let newLevel = prev.level;
          if (newXp >= newLevel * 100) newLevel += 1;

          const updatedAchievements = prev.achievements.map((ach) => {
            if (ach.id === 'song_hero') {
              return { ...ach, progress: 1, unlocked: true };
            }
            return ach;
          });

          return {
            ...prev,
            coins: newCoins,
            xp: newXp,
            level: newLevel,
            completedSongs: Array.from(new Set([...prev.completedSongs, selectedSong.id])),
            achievements: updatedAchievements,
          };
        });
      } else {
        setCurrentNoteIndex(nextIdx);
      }
    }
  }, [detectedNote, selectedSong, currentNoteIndex, songCompleted]);

  const startSong = (song: Song) => {
    setSelectedSong(song);
    setCurrentNoteIndex(0);
    setSongCompleted(false);
  };

  const handleTestStep = () => {
    if (!targetNoteObj) return;
    audioManager.playNoteTone(targetNoteObj.freq);
    const nextIdx = currentNoteIndex + 1;
    if (nextIdx >= songNotes.length) {
      setSongCompleted(true);
      audioManager.playSuccessSound();
      updateProfile((prev) => ({
        ...prev,
        coins: prev.coins + 30,
        xp: prev.xp + 50,
        completedSongs: Array.from(new Set([...prev.completedSongs, selectedSong!.id])),
      }));
    } else {
      setCurrentNoteIndex(nextIdx);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/25 px-3 py-1 rounded-full text-yellow-200 text-xs font-bold mb-2">
            <Music2 className="w-4 h-4 animate-bounce" /> Furulya Dalok Iskolája
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Játszd el kedvenc gyerekdalaidat!</h2>
          <p className="text-amber-100 text-sm mt-1">Kövesd a hangok sorrendjét a mikrofonnal vagy teszteld végig őket.</p>
        </div>
        <div className="hidden md:block text-5xl">🎼</div>
      </div>

      {selectedSong ? (
        /* Active Song Player View */
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-100 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                {selectedSong.difficulty}
              </span>
              <h3 className="text-3xl font-black text-gray-800 mt-2">{selectedSong.title}</h3>
              <p className="text-gray-500 text-sm">{selectedSong.description}</p>
            </div>
            <button
              onClick={() => setSelectedSong(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-2xl text-xs transition-all"
            >
              ← Vissza a dalokhoz
            </button>
          </div>

          {songCompleted ? (
            <div className="bg-amber-500 text-white p-8 rounded-3xl text-center space-y-4 shadow-lg animate-fade-in">
              <Sparkles className="w-16 h-16 text-yellow-300 mx-auto animate-bounce" />
              <h3 className="text-3xl font-black">Gratulálok! Sikeresen eljátszottad a dalt! 🏆</h3>
              <p className="text-amber-100 font-bold">+30 Arany, +50 XP</p>
              <button
                onClick={() => setSelectedSong(null)}
                className="bg-white text-amber-900 font-black px-6 py-3 rounded-2xl shadow hover:scale-105 transition-all"
              >
                További dalok
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Note Sequence Flow */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 flex flex-wrap items-center justify-center gap-3">
                {songNotes.map((noteId, idx) => {
                  const isCurrent = idx === currentNoteIndex;
                  const isDone = idx < currentNoteIndex;
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-sm transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-amber-500 text-white scale-110 ring-4 ring-amber-200 animate-pulse'
                          : isDone
                          ? 'bg-emerald-500 text-white opacity-80'
                          : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                    >
                      <span>{noteId}</span>
                      <span className="text-[10px] font-normal">{isDone ? '✓' : idx + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Current Target Hint */}
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Következő hang:</span>
                  <div className="text-4xl font-black text-amber-900">{targetNoteObj?.name}</div>
                  <p className="text-amber-700 text-sm">{targetNoteObj?.description}</p>
                </div>

                <div className="flex gap-3">
                  {targetNoteObj && (
                    <button
                      onClick={() => audioManager.playNoteTone(targetNoteObj.freq)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow flex items-center gap-2"
                    >
                      Hang lejátszása
                    </button>
                  )}
                  <button
                    onClick={handleTestStep}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-2xl font-black text-xs shadow flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Teszt (Lépés)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Songs List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SONGS_DATABASE.map((song) => {
            const isCompleted = profile.completedSongs.includes(song.id);
            return (
              <div
                key={song.id}
                onClick={() => startSong(song)}
                className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full">
                      {song.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" /> Teljesítve
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-gray-800 group-hover:text-amber-600 transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{song.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold">{song.notes.length} hang</span>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 group-hover:translate-x-1 transition-transform">
                    Dal indítása <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
