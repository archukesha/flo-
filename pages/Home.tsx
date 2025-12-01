
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card, BottomSheet, Slider, Button } from '../components/UI';
import { parseDate, formatDate, formatDateRu, haptic, tg, cn } from '../lib/utils';
import { Droplet, Moon, Heart, Activity, ChevronRight, Sparkles, Zap } from 'lucide-react';

// --- Components ---

const HomeHeader = React.memo(({ cycleDay, phase }: { cycleDay: number, phase: string }) => {
  return (
    <div className="text-center space-y-2 pt-8 pb-4 animate-in slide-in-from-top-4 duration-700 page-enter">
      <div className="inline-block px-3 py-1 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-300 tracking-wider uppercase">{phase}</p>
      </div>
      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 tracking-tight">
        День {cycleDay}
      </h1>
    </div>
  );
});

const CycleRing = React.memo(({ 
  cycleLength, 
  periodLength, 
  currentDay, 
  daysUntilPeriod 
}: { 
  cycleLength: number;
  periodLength: number;
  currentDay: number;
  daysUntilPeriod: number;
}) => {
  const radius = 110;
  const strokeWidth = 16; // Thicker ring
  const center = 140;
  const circumference = 2 * Math.PI * radius;

  const safeCycleLength = Math.max(21, Math.min(45, cycleLength));
  const safePeriodLength = Math.min(periodLength, safeCycleLength);
  
  const ovulationDay = safeCycleLength - 14;
  const fertileStart = ovulationDay - 2;
  const fertileEnd = ovulationDay + 2;

  const createArc = (start: number, end: number) => {
    const length = end - start + 1;
    const dashArray = (length / safeCycleLength) * circumference;
    const rotation = ((start - 1) / safeCycleLength) * 360 - 90;
    return { dashArray, rotation };
  };

  const periodArc = createArc(1, safePeriodLength);
  const fertileArc = createArc(fertileStart, fertileEnd);
  const cursorRotation = ((currentDay - 1) / safeCycleLength) * 360 - 90;

  return (
    <div 
      className="relative flex justify-center items-center py-6 tap-highlight-transparent" 
      onClick={() => {
        haptic('light');
        window.location.hash = '#/calendar';
      }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-75 animate-pulse-glow" />

      <svg className="w-[280px] h-[280px] drop-shadow-2xl" viewBox="0 0 280 280">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E97A9A" />
            <stop offset="100%" stopColor="#B9A2E1" />
          </linearGradient>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(200,200,200,0.1)" />
            <stop offset="100%" stopColor="rgba(200,200,200,0.2)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Track */}
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-gray-100/50 dark:stroke-white/5" />
        
        {/* Period Segment */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${periodArc.dashArray} ${circumference}`}
          strokeLinecap="round"
          className="stroke-primary"
          transform={`rotate(${periodArc.rotation} ${center} ${center})`}
          filter="url(#glow)"
        />
        
        {/* Fertile Segment */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${fertileArc.dashArray} ${circumference}`}
          strokeLinecap="round"
          className="stroke-secondary opacity-50"
          transform={`rotate(${fertileArc.rotation} ${center} ${center})`}
        />

        {/* Cursor / Today Marker */}
        <g transform={`rotate(${cursorRotation} ${center} ${center})`} className="transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
           {/* Ripple Effect */}
           <circle cx={center + radius} cy={center} r={20} className="fill-primary/20 animate-ping opacity-75" />
           <circle cx={center + radius} cy={center} r={12} fill="url(#ringGradient)" className="stroke-white dark:stroke-black stroke-[3px] shadow-lg" />
        </g>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         <div className="flex flex-col items-center animate-float">
             <span className="text-6xl font-black bg-gradient-to-b from-gray-800 to-gray-400 dark:from-white dark:to-gray-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm">
                {currentDay}
             </span>
             <div className="mt-3 px-3 py-1.5 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
                <span className="text-xs text-primary font-bold whitespace-nowrap">
                   {daysUntilPeriod > 0 ? `Через ${daysUntilPeriod} дн.` : 'Сегодня'}
                </span>
             </div>
         </div>
      </div>
    </div>
  );
});

const PredictionCards = React.memo(({ predictions }: { predictions: any }) => {
  const navigate = useNavigate();
  const { nextPeriodStart, ovulation } = predictions;
  
  const handleNav = (hash: string) => {
    haptic('light');
    navigate(`/calendar${hash}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-2">
       <Card 
          className="p-5 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group border-0 ring-1 ring-black/5 dark:ring-white/10"
          onClick={() => handleNav('#nextPeriodStart')}
       >
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
             <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Droplet size={18} fill="currentColor" />
             </div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Месячные</span>
          </div>
          <div className="font-bold text-gray-900 dark:text-white text-md relative z-10 leading-tight">
             {formatDateRu(nextPeriodStart)}
          </div>
       </Card>

       <Card 
          className="p-5 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group border-0 ring-1 ring-black/5 dark:ring-white/10"
          onClick={() => handleNav('#ovulation')}
       >
          <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/20 transition-colors" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
             <div className="p-2 bg-secondary/10 rounded-full text-secondary">
                <Sparkles size={18} />
             </div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Овуляция</span>
          </div>
          <div className="font-bold text-gray-900 dark:text-white text-md relative z-10 leading-tight">
             {formatDateRu(ovulation)}
          </div>
       </Card>
    </div>
  );
});

const QuickLog = React.memo(({ 
  log, 
  onLog 
}: { 
  log: any, 
  onLog: (k: string, val: any) => void 
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const items = [
    { key: 'pain_belly', label: 'Боль', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { key: 'mood', label: 'Муд', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { key: 'fatigue', label: 'Энергия', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { key: 'libido', label: 'Либидо', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center px-3">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Как ты?</h3>
      </div>
      
      <div className="flex gap-3 px-2 overflow-x-auto no-scrollbar pb-2">
        {items.map(s => {
          const isActive = !!log?.symptoms?.[s.key];
          const val = log?.symptoms?.[s.key];
          return (
            <button
              key={s.key}
              onClick={() => {
                haptic('light');
                if (isActive) setActiveItem(s.key);
                else onLog(s.key, 1);
              }}
              className={cn(
                "min-w-[100px] flex flex-col items-center justify-center gap-2 py-4 rounded-[20px] border transition-all duration-300 active:scale-95 relative overflow-hidden",
                isActive 
                  ? "bg-white dark:bg-zinc-800 border-primary shadow-lg shadow-primary/20 ring-1 ring-primary" 
                  : "glass-card border-white/20"
              )}
            >
               {isActive && <div className="absolute inset-0 bg-primary/5" />}
               <div className={cn("p-2.5 rounded-full transition-colors", isActive ? "bg-primary text-white" : cn(s.bg, s.color))}>
                 <s.icon size={20} fill={isActive ? "currentColor" : "none"} />
               </div>
               <span className={cn("text-xs font-bold", isActive ? "text-primary" : "text-gray-500")}>{s.label}</span>
            </button>
          );
        })}
      </div>

      <BottomSheet isOpen={!!activeItem} onClose={() => setActiveItem(null)} title="Интенсивность">
         <div className="pb-8 pt-4">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-6 px-1 tracking-wide uppercase">
               <span>Нет</span><span>Слабо</span><span>Средне</span><span>Сильно</span>
            </div>
            <Slider 
               min={0} max={3} step={1}
               value={activeItem ? (log?.symptoms?.[activeItem] || 0) : 0}
               onChange={(v) => {
                  haptic('light');
                  if (activeItem) {
                     onLog(activeItem, v);
                     if (v === 0) setActiveItem(null);
                  }
               }}
            />
            <Button fullWidth className="mt-8 shadow-xl" onClick={() => setActiveItem(null)}>Готово</Button>
         </div>
      </BottomSheet>
    </div>
  );
});

const AdviceTeaser = React.memo(({ phase }: { phase: string }) => {
  const navigate = useNavigate();
  // Mock content
  const cards = [
      { id: '1', title: 'Йога для снятия боли', tag: 'Здоровье', bg: 'from-pink-500 to-rose-500' },
      { id: '2', title: 'Что есть в эту фазу?', tag: 'Питание', bg: 'from-orange-400 to-amber-500' }
  ];

  return (
    <div className="space-y-4 pt-4 pb-28">
      <div 
        className="flex justify-between items-center px-3 cursor-pointer active:opacity-70"
        onClick={() => navigate('/advice')}
      >
         <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Для тебя</h3>
         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
            <ChevronRight size={16} className="text-gray-500 dark:text-white" />
         </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
         {cards.map(card => (
            <div 
               key={card.id}
               onClick={() => navigate(`/advice`)}
               className="min-w-[240px] h-32 relative rounded-[24px] overflow-hidden snap-start active:scale-95 transition-transform shadow-lg cursor-pointer"
            >
               {/* Artistic Background */}
               <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", card.bg)} />
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
               
               <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                   <span className="self-start text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {card.tag}
                   </span>
                   <h4 className="font-bold text-white text-lg leading-tight w-3/4">
                      {card.title}
                   </h4>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
});

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logs, addLog, getPredictions } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => formatDate(now), [now]);
  const log = logs[todayStr] || { symptoms: {}, menstruation: { active: false }, mood: null };
  const hasLog = (Object.keys(log.symptoms).length > 0) || log.menstruation?.active || !!log.mood;

  const calculations = useMemo(() => {
    const lastPeriodDate = parseDate(profile.cycle.lastPeriodStart);
    const diff = Math.floor((now.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = (diff >= 0 ? diff : 0) % profile.cycle.averageLength + 1;
    
    let phase = "Фолликулярная фаза";
    if (cycleDay <= profile.cycle.periodLength) phase = "Менструальная фаза";
    else if (cycleDay === profile.cycle.averageLength - 14) phase = "Овуляция";
    else if (cycleDay > profile.cycle.averageLength - 14) phase = "Лютеиновая фаза";
    
    const preds = getPredictions();
    return { cycleDay, phase, predictions: preds };
  }, [now, profile.cycle, getPredictions]);

  const handleQuickLog = useCallback((key: string, val: number) => {
    const newSymptoms = { ...log.symptoms };
    if (val === 0) delete newSymptoms[key];
    else newSymptoms[key] = val;
    
    const newLog = { 
        ...log, 
        symptoms: newSymptoms,
        date: todayStr,
        lastModified: Date.now()
    };
    if (!newLog.menstruation) newLog.menstruation = { active: false };
    if (!newLog.sex) newLog.sex = { active: false };
    addLog(todayStr, newLog as any);
  }, [log, todayStr, addLog]);

  const handleMainBtnClick = useCallback(() => {
    haptic('light');
    navigate(`/log/${todayStr}`);
  }, [todayStr, navigate]);

  useEffect(() => {
    if (!tg) return;
    tg.MainButton.show();
    tg.MainButton.setText(hasLog ? "Редактировать запись" : "Отметить самочувствие");
    tg.MainButton.setParams({
      color: tg.themeParams?.button_color || '#E97A9A',
      text_color: tg.themeParams?.button_text_color || '#FFFFFF'
    });
    tg.MainButton.onClick(handleMainBtnClick);
    return () => tg.MainButton.offClick(handleMainBtnClick);
  }, [hasLog, handleMainBtnClick]);

  return (
    <div className="min-h-screen px-4 overscroll-y-none pb-safe">
      <HomeHeader cycleDay={calculations.cycleDay} phase={calculations.phase} />
      <CycleRing 
        cycleLength={profile.cycle.averageLength}
        periodLength={profile.cycle.periodLength}
        currentDay={calculations.cycleDay}
        daysUntilPeriod={calculations.predictions.daysUntilPeriod}
      />
      <PredictionCards predictions={calculations.predictions} />
      <QuickLog log={log} onLog={handleQuickLog} />
      <AdviceTeaser phase={calculations.phase} />
    </div>
  );
};
