import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Gamepad2, BookOpen, Mic, Music2, ShoppingBag, Award, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile;
  setActiveTab: (tab: string) => void;
  isMicActive: boolean;
  toggleMic: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  setActiveTab,
  isMicActive,
  toggleMic,
}) => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-yellow-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Üdvözöl a Furulya Mágus Birodalom!
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
            Itt az idő varázsolni a furulyáddal! 🎶
          </h2>
          <p className="text-purple-100 text-sm md:text-base max-w-lg">
            Tanuld meg a fogásokat, játssz a lufipukkasztó játékkal, gyűjts aranyat és oldj fel fantasztikus lufi skineket!
          </p>

          <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => setActiveTab('game')}
              className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 px-6 py-3 rounded-2xl font-black text-base shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" /> Lufi Játék Indítása
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('fingering')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-5 py-3 rounded-2xl font-bold text-base backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Fogástábla
            </button>
          </div>
        </div>

        {/* Mascot / Illustration */}
        <div className="z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex flex-col items-center text-center shadow-inner">
          <div className="text-6xl mb-2 animate-bounce">🧙‍♂️🎶</div>
          <div className="text-lg font-black text-yellow-300">Szint {profile.level} Mágus</div>
          <div className="text-xs text-purple-200 mt-1">Összes lufi: {profile.totalBalloonsPopped} 🎈</div>
          {!isMicActive && (
            <button
              onClick={toggleMic}
              className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-all animate-pulse"
            >
              🎙️ Mikrofon Bekapcsolása
            </button>
          )}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
          <span>✨ Válassz kalandot:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fingering Card */}
          <div
            onClick={() => setActiveTab('fingering')}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-3xl shadow-lg hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-200" />
              </div>
              <h4 className="text-xl font-black mb-1">Fogástábla</h4>
              <p className="text-blue-100 text-sm">Nézd meg hogyan kell fogni a hangokat a furulyán és hallgasd meg őket!</p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-bold text-xs text-blue-200 group-hover:translate-x-1 transition-transform">
              Megnyitás <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Practice Card */}
          <div
            onClick={() => setActiveTab('practice')}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-lg hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-emerald-200" />
              </div>
              <h4 className="text-xl font-black mb-1">Gyakorló Mód</h4>
              <p className="text-emerald-100 text-sm">Játssz hangokat a mikrofonba, és a varázsmérő megmutatja, eltaláltad-e!</p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-bold text-xs text-emerald-200 group-hover:translate-x-1 transition-transform">
              Gyakorlás <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Game Card */}
          <div
            onClick={() => setActiveTab('game')}
            className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-3xl shadow-lg hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6 text-pink-200" />
              </div>
              <h4 className="text-xl font-black mb-1">Lufi Pukkasztó</h4>
              <p className="text-purple-100 text-sm">Fújd le a helyes hangot a lufikról, pukkaszd ki őket és gyűjts aranyat!</p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-bold text-xs text-pink-200 group-hover:translate-x-1 transition-transform">
              Játék <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Songs Card */}
          <div
            onClick={() => setActiveTab('songs')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-3xl shadow-lg hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Music2 className="w-6 h-6 text-amber-200" />
              </div>
              <h4 className="text-xl font-black mb-1">Dalok</h4>
              <p className="text-amber-100 text-sm">Tanulj meg ismert gyerekdalokat lépésről lépésre a furulyádon!</p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-bold text-xs text-amber-200 group-hover:translate-x-1 transition-transform">
              Dalok listája <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Shop Card */}
          <div
            onClick={() => setActiveTab('shop')}
            className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white p-6 rounded-3xl shadow-lg hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-yellow-200" />
              </div>
              <h4 className="text-xl font-black mb-1">Lufi Bolt</h4>
              <p className="text-yellow-100 text-sm">Vásárolj menő új lufi skineket a játékban gyűjtött aranyaidból!</p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-bold text-xs text-yellow-200 group-hover:translate-x-1 transition-transform">
              Vásárlás <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Achievements Card */}
          <div
            onClick={() => setActiveTab('achievements')}
            className="bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-6 rounded-3xl shadow-lg hover:scale-102 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-cyan-200" />
              </div>
              <h4 className="text-xl font-black mb-1">Díjak & Jelvények</h4>
              <p className="text-cyan-100 text-sm">Teljesítsd a kihívásokat, nyerj jutalmakat és gyűjtsd be az összes jelvényt!</p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-bold text-xs text-cyan-200 group-hover:translate-x-1 transition-transform">
              Megtekintés <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
