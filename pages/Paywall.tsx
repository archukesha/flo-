import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, X } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { useStore } from '../store';
import { haptic } from '../lib/utils';

export const Paywall: React.FC = () => {
  const navigate = useNavigate();
  const setSubscription = useStore((state) => state.setSubscription);

  const handleSubscribe = () => {
    // Mock payment
    haptic('success');
    setSubscription('pro');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col relative">
      <button 
        onClick={() => navigate('/home')} 
        className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full z-10"
      >
        <X size={20} className="text-gray-500" />
      </button>

      {/* Hero Image / Gradient */}
      <div className="h-[40vh] bg-gradient-to-br from-primary via-secondary to-purple-400 relative overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 bg-black/10"></div>
         <div className="text-center text-white z-10 p-6">
            <div className="inline-block p-3 bg-white/20 backdrop-blur-lg rounded-2xl mb-4 shadow-xl">
              <Star size={40} fill="white" className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">FLO+ Premium</h1>
            <p className="text-white/90 font-medium">Твоё тело. Твои правила.</p>
         </div>
         {/* Decorative circles */}
         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
         <div className="absolute top-10 -right-10 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 -mt-10 bg-white dark:bg-black rounded-t-[32px] p-6 z-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">Что ты получишь:</h2>
          
          <div className="space-y-4">
            {[
              'Неограниченные инсайты здоровья',
              'Персональные советы по симптомам',
              'Экспорт данных для врача',
              'Приватный режим и защита PIN'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="min-w-[24px] h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
             <Card className="border-2 border-primary bg-primary/5 relative overflow-visible">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Популярный выбор
                </div>
                <div className="flex justify-between items-center p-2">
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">149 ₽ <span className="text-sm font-normal text-gray-500">/ мес</span></div>
                    <div className="text-xs text-gray-500">Отмена в любой момент</div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-4 border-primary bg-white"></div>
                </div>
             </Card>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button fullWidth size="xl" onClick={handleSubscribe} className="shadow-xl shadow-primary/30 text-lg">
            Попробовать бесплатно
          </Button>
          <p className="text-center text-[10px] text-gray-400">
            Нажимая кнопку, вы соглашаетесь с Условиями использования и Политикой конфиденциальности. 7 дней бесплатно, затем 149 ₽/мес.
          </p>
        </div>
      </div>
    </div>
  );
};