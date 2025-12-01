import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItem, Button, Toggle } from '../components/UI';
import { useStore } from '../store';
import { haptic } from '../lib/utils';
import { User, Bell, Shield, Star, Trash2, FileText, Download } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile, clearAllData } = useStore();

  const handleReminderToggle = (val: boolean) => {
    haptic('light');
    setProfile({ reminderConsent: val });
  };

  const handleClearData = () => {
    if (confirm('Ты точно хочешь удалить все данные? Это действие нельзя отменить.')) {
      clearAllData();
      haptic('warning');
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-black p-4 pb-24 space-y-6 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Настройки</h1>

      {/* Profile Section */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase px-1">Профиль</h2>
        <ListItem 
           title="Данные цикла" 
           subtitle={`Цикл: ${profile.cycle.averageLength} дн, Мес: ${profile.cycle.periodLength} дн`}
           onClick={() => navigate('/onboarding?force=1')}
           rightIcon={<User size={18} />}
        />
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl">
           <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Уведомления</span>
           </div>
           <Toggle checked={profile.reminderConsent || false} onChange={handleReminderToggle} />
        </div>
      </section>

      {/* Subscription */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase px-1">Подписка</h2>
        <div 
          onClick={() => navigate('/paywall')}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer active:opacity-80"
        >
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary">
                 <Star size={16} fill="currentColor" />
              </div>
              <div>
                 <h3 className="font-bold text-gray-900 dark:text-white">FLO+ Premium</h3>
                 <p className="text-xs text-gray-500">{profile.subscription === 'pro' ? 'Активна' : 'Бесплатный план'}</p>
              </div>
           </div>
           <Button size="sm" variant="secondary" className="px-3">
              {profile.subscription === 'pro' ? 'Управление' : 'Купить'}
           </Button>
        </div>
      </section>

      {/* Data & Legal */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase px-1">Данные</h2>
        <ListItem 
           title="Экспорт данных (PDF/CSV)" 
           rightIcon={<Download size={18} />}
           onClick={() => navigate('/paywall')} // Pro feature usually
        />
        <ListItem 
           title="Политика конфиденциальности" 
           rightIcon={<Shield size={18} />}
        />
        <ListItem 
           title="Условия использования" 
           rightIcon={<FileText size={18} />}
        />
      </section>

      <div className="pt-4">
        <button 
           onClick={handleClearData}
           className="w-full flex items-center justify-center gap-2 text-red-500 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
           <Trash2 size={18} />
           <span className="font-medium">Сбросить все данные</span>
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">Версия 1.0.0 (MVP)</p>
      </div>
    </div>
  );
};