
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, Sparkles, Settings, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/home', icon: Home, label: 'Главная' },
    { path: '/calendar', icon: Calendar, label: 'Календарь' },
    { path: '/advice', icon: Lightbulb, label: 'Советы' },
    { path: '/insights', icon: Sparkles, label: 'Инсайты' },
    { path: '/settings', icon: Settings, label: 'Меню' },
  ];

  // Hide nav on specific pages
  if (['/onboarding', '/paywall'].includes(location.pathname) || location.pathname.startsWith('/log')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none pb-safe">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex justify-between items-center px-2 py-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center w-14 h-14 space-y-1 rounded-2xl transition-all duration-300 active:scale-90"
              >
                {/* Active Indicator Blob */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl scale-100 animate-in fade-in zoom-in-95 duration-200" />
                )}
                
                <tab.icon 
                  size={24} 
                  className={cn(
                    "relative z-10 transition-all duration-300", 
                    isActive ? "text-primary scale-110" : "text-gray-400 dark:text-gray-500"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  "relative z-10 text-[9px] font-bold transition-all duration-300", 
                  isActive ? "text-primary opacity-100 translate-y-0" : "text-gray-400 opacity-0 -translate-y-2 hidden"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
