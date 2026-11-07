import React, { useState } from 'react';
import { RECORDER_NOTES } from '../data/notes';
import { NoteInfo } from '../types';
import { Volume2, BookOpen, Sparkles, CheckCircle2, Music } from 'lucide-react';
import { audioManager } from '../utils/audio';

export const FingeringView: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<NoteInfo>(RECORDER_NOTES[0]);

  const playNote = (note: NoteInfo) => {
    setSelectedNote(note);
    audioManager.playNoteTone(note.freq);
  };

  const fingerLabels = [
    { hand: 'Bal kéz', finger: '2. ujj (Mutató)' },
    { hand: 'Bal kéz', finger: '3. ujj (Közép)' },
    { hand: 'Bal kéz', finger: '4. ujj (Gyűrűs)' },
    { hand: 'Jobb kéz', finger: '2. ujj (Mutató)' },
    { hand: 'Jobb kéz', finger: '3. ujj (Közép)' },
    { hand: 'Jobb kéz', finger: '4. ujj (Gyűrűs)' },
    { hand: 'Jobb kéz', finger: '5. ujj (Kisujj)' },
  ];

  // Map note to staff vertical position (Y coordinate on 5-line staff without treble clef)
  // Staff lines are at y = 25, 37, 49, 61, 73 (spacing = 12px)
  const getNoteStaffY = (id: string): { y: number; hasLedgerLine?: boolean; accidental?: string } => {
    switch (id) {
      case 'C4': // c' (ledger line below staff)
        return { y: 85, hasLedgerLine: true };
      case 'D4': // d' (space below 1st line)
        return { y: 79 };
      case 'E4': // e' (1st line)
        return { y: 73 };
      case 'F4': // f' (1st space)
        return { y: 67 };
      case 'FISZ4': // fisz' (1st space with #)
        return { y: 67, accidental: '♯' };
      case 'G4': // g' (2nd line)
        return { y: 61 };
      case 'A4': // a' (2nd space)
        return { y: 55 };
      case 'BETA4': // b' (3rd line with ♭)
        return { y: 49, accidental: '♭' };
      case 'B4': // h' (3rd line)
        return { y: 49 };
      case 'C5': // c'' (3rd space)
        return { y: 43 };
      case 'CISZ5': // cisz'' (3rd space with #)
        return { y: 43, accidental: '♯' };
      case 'D5': // d'' (4th line)
        return { y: 37 };
      default:
        return { y: 73 };
    }
  };

  const staffInfo = getNoteStaffY(selectedNote.id);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/25 px-3 py-1 rounded-full text-yellow-300 text-xs font-bold mb-2">
            <BookOpen className="w-4 h-4" /> Interaktív Fogástábla (Germán rendszer)
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Ismerd meg a furulya fogásokat!</h2>
          <p className="text-blue-100 text-sm mt-1">Bal kéz felül, jobb kéz alul. Válassz egy hangot az alábbi listából!</p>
        </div>
        <div className="hidden md:block text-5xl">🎶</div>
      </div>

      {/* Note Selector Pills */}
      <div className="bg-white rounded-3xl p-4 shadow-md border border-purple-100">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Válassz hangot:</h3>
        <div className="flex flex-wrap gap-2">
          {RECORDER_NOTES.map((note) => {
            const isSelected = selectedNote.id === note.id;
            return (
              <button
                key={note.id}
                onClick={() => playNote(note)}
                className={`px-4 py-2.5 rounded-2xl font-black text-sm transition-all shadow-sm flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{note.name}</span>
                <span className="text-xs opacity-80 font-normal">({note.difficulty})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Layout: Recorder Graphic on Left, Info & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Realistic Wooden Recorder Graphic with Perfectly Aligned Row Labels (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-lg border border-purple-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
            <Sparkles className="w-3.5 h-3.5" /> Germán furulya modell
          </div>

          <div className="my-4 flex flex-col items-center w-full">
            {/* Hand Position Indicators Outside */}
            <div className="w-full flex justify-between text-xs font-bold text-indigo-700 mb-3 px-2">
              <span className="bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">👆 Bal kéz (Felül)</span>
              <span className="bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">👇 Jobb kéz (Alul)</span>
            </div>

            {/* Container for recorder with side-aligned labels */}
            <div className="relative flex items-center justify-center w-full py-2">
              
              {/* Left Side: Thumb Hole Label placed even higher up */}
              <div className="absolute left-1 top-[14px] flex flex-col items-end text-right pr-2">
                <span className="text-[11px] font-extrabold text-gray-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shadow-sm">
                  Hátulsó lyuk
                </span>
                <span className="text-[9px] text-gray-500 font-bold">(1. ujj - Hüvelykujj)</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold mt-0.5 ${
                  selectedNote.fingering.thumb ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {selectedNote.fingering.thumb === 'half' ? 'Fél lyuk' : selectedNote.fingering.thumb ? 'Befogva' : 'Nyitva'}
                </span>
              </div>

              {/* Center: Clean Wooden Recorder Tube */}
              <div className="w-16 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 border-4 border-amber-950 rounded-3xl py-6 px-2 flex flex-col items-center gap-3.5 shadow-2xl relative shrink-0 z-10">
                <div className="absolute inset-y-0 left-1.5 w-1.5 bg-white/20 rounded-full blur-[1px] pointer-events-none" />

                {/* Mouthpiece */}
                <div className="w-14 h-10 bg-gradient-to-b from-amber-200 to-amber-400 rounded-t-2xl border-2 border-amber-950 -mt-6 mb-1 flex flex-col items-center justify-center shadow-md relative">
                  <div className="w-8 h-1 bg-amber-950 rounded-full mb-0.5" />
                  <div className="w-2.5 h-2.5 bg-amber-900 rounded-sm border border-amber-950" />
                </div>

                {/* Thumb hole */}
                <div className={`w-6 h-6 rounded-full border-2 border-amber-950 shadow-inner transition-all flex items-center justify-center ${
                  selectedNote.fingering.thumb === true
                    ? 'bg-amber-950 ring-2 ring-amber-900/50'
                    : selectedNote.fingering.thumb === 'half'
                    ? 'bg-amber-500/80'
                    : 'bg-amber-100'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                </div>

                <div className="w-full h-0.5 bg-amber-950/30 my-0.5" />

                {/* Front 7 holes */}
                {selectedNote.fingering.holes.map((isCovered, idx) => {
                  const isDoubleHole = idx >= 5;
                  return (
                    <div key={idx} className="flex items-center justify-center w-full my-0.5">
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-amber-950 transition-all shadow-inner flex items-center justify-center ${
                          isCovered === true
                            ? 'bg-amber-950 ring-2 ring-amber-900/50 scale-105'
                            : isCovered === 'half'
                            ? 'bg-amber-500/80'
                            : 'bg-amber-100'
                        }`}
                      >
                        <div className={`rounded-full bg-white/30 ${isDoubleHole ? 'w-1 h-1' : 'w-2 h-2'}`} />
                      </div>
                    </div>
                  );
                })}

                {/* Bell */}
                <div className="w-20 h-5 bg-gradient-to-t from-amber-300 to-amber-500 rounded-b-2xl border-2 border-amber-950 -mb-6 mt-2 shadow-md" />
              </div>

              {/* Right Side: Row-aligned Finger Labels */}
              <div className="absolute right-1 top-[128px] flex flex-col gap-[13px] text-left">
                {fingerLabels.map((info, idx) => {
                  const isCovered = selectedNote.fingering.holes[idx];
                  const isLeftHand = idx < 3;
                  const isRightHandStart = idx === 3;
                  return (
                    <React.Fragment key={idx}>
                      {isRightHandStart && (
                        <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 -my-1">
                          Jobb kéz alul
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 ${isCovered ? 'bg-amber-950' : 'bg-amber-100'}`} />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-800 leading-tight">{info.finger}</span>
                          <span className="text-[8px] text-gray-500">{isLeftHand ? 'Bal kéz' : 'Jobb kéz'}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

            </div>

            {/* Musical Staff Card (Ötvonalas kotta - Ledger line shifted slightly left: x1="80" x2="130") */}
            <div className="w-full mt-6 bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 mb-2">
                <Music className="w-4 h-4 text-amber-700" /> Kottahely ({selectedNote.name})
              </div>
              
              <svg width="220" height="100" className="bg-white rounded-xl border border-amber-300 shadow-inner">
                {/* 5 Staff lines */}
                {[25, 37, 49, 61, 73].map((y, i) => (
                  <line key={i} x1="15" y1={y} x2="205" y2={y} stroke="#1e293b" strokeWidth="1.5" />
                ))}

                {/* Ledger line shifted slightly left (x1="80" x2="130") */}
                {staffInfo.hasLedgerLine && (
                  <line x1="80" y1="85" x2="130" y2="85" stroke="#1e293b" strokeWidth="1.5" />
                )}

                {/* Accidental (# or ♭) if needed */}
                {staffInfo.accidental && (
                  <text x="88" y={staffInfo.y + 6} fontSize="24" fontFamily="sans-serif" fill="#1e293b" fontWeight="bold">
                    {staffInfo.accidental}
                  </text>
                )}

                {/* Notehead only */}
                <ellipse
                  cx={staffInfo.accidental ? "118" : "105"}
                  cy={staffInfo.y}
                  rx="7"
                  ry="5"
                  fill="#1e293b"
                  transform={`rotate(-15 ${staffInfo.accidental ? "118" : "105"} ${staffInfo.y})`}
                />
              </svg>
            </div>

            <div className="text-xs text-gray-500 mt-4 flex items-center gap-3 bg-gray-50 px-3.5 py-2 rounded-2xl border border-gray-200 shadow-sm">
              <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-amber-950 rounded-full inline-block border border-amber-800" /> Befogott</span>
              <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-amber-100 border border-amber-950 rounded-full inline-block" /> Nyitott</span>
            </div>
          </div>
        </div>

        {/* Right: Note Info & Sound Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-purple-100 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-wide">
                  {selectedNote.difficulty}
                </span>
                <h3 className="text-5xl font-black text-gray-800 mt-2">{selectedNote.name}</h3>
                <p className="text-base font-bold text-indigo-600 mt-1">Germán rendszerű furulya fogás</p>
              </div>
              <button
                onClick={() => playNote(selectedNote)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg flex items-center gap-2.5 transition-all hover:scale-105"
                title="Hang lejátszása"
              >
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span className="font-bold text-sm">Meghallgatás</span>
              </button>
            </div>

            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 space-y-2">
              <h4 className="font-extrabold text-purple-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" /> Hogyan fogd be a furulyát?
              </h4>
              <p className="text-purple-800 text-base leading-relaxed">{selectedNote.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-400 font-bold block">Frekvencia</span>
                <span className="text-xl font-black text-gray-700">{selectedNote.freq} Hz</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-400 font-bold block">Kézrendszer</span>
                <span className="text-sm font-black text-indigo-700">Bal felül, Jobb alul</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Tipp: Gyakorold ezt a hangot a Gyakorló módban és a Lufi Játékban is!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
