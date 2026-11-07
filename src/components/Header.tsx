import React from 'react';
import { UserProfile } from '../types';
import { Music, Coins, Zap, Flame, Award, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMicActive: boolean;
  toggleMic: () => void;
  nickname: string;
  onLogout: () => void;
  logoutPending: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  isMicActive,
  toggleMic,
  nickname,
  onLogout,
  logoutPending,
}) => {
  const xpNeeded = profile.level * 100;
  const xpProgress = Math.min(100, Math.floor((profile.xp / xpNeeded) * 100));

  return (
    <header className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Music className="w-7 h-7 text-yellow-300 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide flex items-center gap-2 drop-shadow-md">
              Furulya Mágus <span className="text-xs bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full font-bold uppercase">8+</span>
            </h1>
            <p className="text-xs text-purple-200">Varázslatos furulya suli gyerekeknek</p>
          </div>
        </div>

        {/* Stats & Currencies */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
            {nickname}
          </span>
          <button
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold transition hover:bg-white/25 disabled:opacity-60"
            disabled={logoutPending}
            onClick={onLogout}
            type="button"
          >
            {logoutPending ? 'Mentés...' : 'Kilépés'}
          </button>
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-yellow-400/40 shadow-inner">
            <Coins className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="font-extrabold text-yellow-300 tabular-nums">{profile.coins}</span>
            <span className="text-xs text-yellow-200/80">arany</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-orange-400/40">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-extrabold text-orange-300 tabular-nums">{profile.streak}</span>
            <span className="text-xs text-orange-200/80">nap</span>
          </div>

          {/* Level & XP */}
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-purple-400/40">
            <Zap className="w-5 h-5 text-cyan-300" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-cyan-200">Szint {profile.level}</span>
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" 
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mic Toggle Button */}
          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-md ${
              isMicActive
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse ring-2 ring-emerald-300'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            <span>🎙️ {isMicActive ? 'Mikrofon BE' : 'Mikrofon KI'}</span>
          </button>

          {/* Shop Button */}
          <button
            onClick={() => setActiveTab('shop')}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bolt</span>
          </button>

          {/* Achievements Button */}
          <button
            onClick={() => setActiveTab('achievements')}
            className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            <Award className="w-4 h-4" />
            <span>Díjak</span>
          </button>
        </div>
      </div>
    </header>
  );
};
