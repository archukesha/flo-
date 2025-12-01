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
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800 pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center w-16 h-14 space-y-1"
          >
            <tab.icon 
              size={24} 
              className={cn("transition-colors", isActive ? "text-primary" : "text-gray-400 dark:text-gray-600")} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-gray-400 dark:text-gray-600")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};