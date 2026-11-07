import React from 'react';
import { UserProfile } from '../types';
import { Award, CheckCircle2, Coins, Sparkles } from 'lucide-react';

interface AchievementsViewProps {
  profile: UserProfile;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ profile }) => {
  const completedCount = profile.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/25 px-3 py-1 rounded-full text-cyan-200 text-xs font-bold mb-2">
            <Award className="w-4 h-4" /> Dicsőségcsarnok & Díjak
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Gyűjtsd be az összes jelvényt!</h2>
          <p className="text-cyan-100 text-sm mt-1">Teljesítsd a kihívásokat a furulya tanulás és a lufi játék közben!</p>
        </div>
        <div className="hidden md:block text-5xl">🏆</div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-3xl p-4 shadow-md border border-purple-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">Teljesített díjak:</span>
        <div className="flex items-center gap-2 font-black text-indigo-600 text-lg">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span>{completedCount} / {profile.achievements.length}</span>
        </div>
      </div>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.achievements.map((ach) => {
          const progressPercent = Math.min(100, Math.floor((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`bg-white rounded-3xl p-6 shadow-lg border transition-all flex items-start gap-4 ${
                ach.unlocked ? 'border-emerald-300 bg-emerald-50/20' : 'border-purple-100'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md shrink-0 ${
                ach.unlocked ? 'bg-emerald-500 text-white animate-bounce' : 'bg-gray-100 text-gray-400'
              }`}>
                {ach.icon}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-800">{ach.title}</h3>
                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" /> Teljesítve
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
                      <Coins className="w-3.5 h-3.5" /> +{ach.rewardCoins}
                    </span>
                  )}
                </div>

                <p className="text-gray-500 text-sm">{ach.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>Haladás</span>
                    <span className="tabular-nums">{ach.progress} / {ach.maxProgress}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${ach.unlocked ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
