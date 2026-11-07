import React from 'react';
import { UserProfile, BalloonSkin } from '../types';
import { INITIAL_BALLOON_SKINS } from '../data/notes';
import { audioManager } from '../utils/audio';
import { ShoppingBag, Coins, Check, Sparkles } from 'lucide-react';

interface ShopViewProps {
  profile: UserProfile;
  updateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ profile, updateProfile }) => {
  const handleBuyOrSelect = (skin: BalloonSkin) => {
    const isUnlocked = profile.unlockedSkins.includes(skin.id);

    if (isUnlocked) {
      // Set as active skin
      audioManager.playCoinSound();
      updateProfile((prev) => ({ ...prev, activeSkin: skin.id }));
    } else {
      // Try to buy
      if (profile.coins >= skin.price) {
        audioManager.playSuccessSound();
        updateProfile((prev) => ({
          ...prev,
          coins: prev.coins - skin.price,
          unlockedSkins: [...prev.unlockedSkins, skin.id],
          activeSkin: skin.id,
        }));
      } else {
        audioManager.playWrongSound();
        alert('Nincs elég aranyad ehhez a lufi skinhez! Pukkassz ki több lufit a játékban!');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/25 px-3 py-1 rounded-full text-yellow-100 text-xs font-bold mb-2">
            <ShoppingBag className="w-4 h-4" /> Varázslatos Lufi Bolt
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Vásárolj menő lufi skineket!</h2>
          <p className="text-amber-100 text-sm mt-1">Használd a játékban gyűjtött aranyaidat, hogy különleges lufikkal játssz!</p>
        </div>
        <div className="hidden md:block text-5xl">🎁</div>
      </div>

      {/* Coins summary bar */}
      <div className="bg-white rounded-3xl p-4 shadow-md border border-purple-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">Egyenleged:</span>
        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-2xl border border-yellow-300">
          <Coins className="w-5 h-5 text-yellow-600 animate-pulse" />
          <span className="font-extrabold text-yellow-800 text-lg tabular-nums">{profile.coins} arany</span>
        </div>
      </div>

      {/* Skins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_BALLOON_SKINS.map((skin) => {
          const isUnlocked = profile.unlockedSkins.includes(skin.id);
          const isActive = profile.activeSkin === skin.id;

          return (
            <div
              key={skin.id}
              className={`bg-white rounded-3xl p-6 shadow-lg border transition-all flex flex-col justify-between relative overflow-hidden ${
                isActive ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-purple-100 hover:scale-102'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-purple-950 font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1 z-10">
                  <Check className="w-3.5 h-3.5" /> Aktív
                </div>
              )}

              <div className="flex flex-col items-center text-center space-y-4 my-2">
                {/* Glossy 3D Balloon Preview */}
                <div
                  className={`w-28 h-32 rounded-full bg-gradient-to-br ${skin.gradient} shadow-xl flex flex-col items-center justify-center border-2 border-white/70 relative ring-4 ring-black/10`}
                  style={{
                    boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.3), 0 10px 25px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="absolute top-3 left-4 w-6 h-9 bg-white/60 rounded-full rotate-[-30deg]" />
                  <span className="text-5xl mb-1 filter drop-shadow-md">{skin.icon}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-800">{skin.name}</h3>
                  {!isUnlocked && (
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-yellow-600 mt-1">
                      <Coins className="w-4 h-4" /> <span>{skin.price} arany</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleBuyOrSelect(skin)}
                className={`w-full py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : isUnlocked
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : profile.coins >= skin.price
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-purple-950 hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isActive ? (
                  'Kiválasztva'
                ) : isUnlocked ? (
                  'Kiválasztás'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Megvásárlás ({skin.price})
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
