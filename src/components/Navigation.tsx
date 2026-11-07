import React from 'react';
import { Home, BookOpen, Mic, Gamepad2, Music2, ShoppingBag, Award } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Főoldal', icon: Home, color: 'from-pink-500 to-rose-500' },
    { id: 'fingering', label: 'Fogástábla', icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
    { id: 'practice', label: 'Gyakorló', icon: Mic, color: 'from-emerald-500 to-teal-500' },
    { id: 'game', label: 'Lufi Játék', icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
    { id: 'songs', label: 'Dalok', icon: Music2, color: 'from-amber-500 to-orange-500' },
    { id: 'shop', label: 'Bolt', icon: ShoppingBag, color: 'from-yellow-500 to-amber-600' },
    { id: 'achievements', label: 'Díjak', icon: Award, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md py-3 px-4 border-b border-purple-100 sticky top-[65px] z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm whitespace-nowrap ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105 ring-2 ring-purple-300`
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-102'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
