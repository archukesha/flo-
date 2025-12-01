import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card, BottomSheet, Slider, Button } from '../components/UI';
import { parseDate, formatDate, formatDateRu, haptic, tg, cn } from '../lib/utils';
import { Droplet, Moon, Heart, Activity, ChevronRight, Sparkles, Zap } from 'lucide-react';

// --- Telemetry Stub ---
const trackEvent = (name: string, params: Record<string, any> = {}) => {
  console.log(`[Telemetry] ${name}`, params);
};

// --- Components ---

const HomeHeader = React.memo(({ cycleDay, phase }: { cycleDay: number, phase: string }) => {
  useEffect(() => {
    trackEvent('home_header_view', { cycle_day: cycleDay });
  }, [cycleDay]);

  return (
    <div className="text-center space-y-1 pt-6 pb-2 animate-in slide-in-from-top-4 duration-500">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Сегодня: День {cycleDay}
      </h1>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{phase}</p>
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
  const strokeWidth = 14;
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
      className="relative flex justify-center items-center py-4 tap-highlight-transparent" 
      onClick={() => {
        haptic('light');
        trackEvent('home_cycle_ring_click');
        window.location.hash = '#/calendar';
      }}
    >
      <svg className="w-[260px] h-[260px] transition-all duration-300 ease-out" viewBox="0 0 280 280">
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-gray-100 dark:stroke-zinc-800" />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${periodArc.dashArray} ${circumference}`}
          strokeLinecap="round"
          className="stroke-primary opacity-40"
          transform={`rotate(${periodArc.rotation} ${center} ${center})`}
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${fertileArc.dashArray} ${circumference}`}
          strokeLinecap="round"
          className="stroke-secondary opacity-60"
          transform={`rotate(${fertileArc.rotation} ${center} ${center})`}
        />
        <g transform={`rotate(${((ovulationDay - 1) / safeCycleLength) * 360 - 90} ${center} ${center})`}>
          <circle cx={center + radius} cy={center} r={5} className="fill-secondary stroke-surface stroke-2" />
        </g>
        <g transform={`rotate(${cursorRotation} ${center} ${center})`} className="transition-transform duration-500 ease-out">
           <circle cx={center + radius} cy={center} r={14} className="fill-primary/20 animate-pulse" />
           <circle cx={center + radius} cy={center} r={8} className="fill-primary stroke-white dark:stroke-black stroke-2" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
            {currentDay}
         </span>
         <span className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide">
            День цикла
         </span>
         <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full">
            <span className="text-[10px] text-gray-500 font-semibold whitespace-nowrap">
               {daysUntilPeriod > 0 ? `Через ${daysUntilPeriod} дн.` : 'Сегодня'}
            </span>
         </div>
      </div>
    </div>
  );
});

const PredictionCards = React.memo(({ predictions }: { predictions: any }) => {
  const navigate = useNavigate();
  const { nextPeriodStart, ovulation } = predictions;
  
  const handleNav = (hash: string, type: string) => {
    haptic('light');
    trackEvent('home_prediction_card_click', { type });
    navigate(`/calendar${hash}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-1">
       <Card 
          className="p-4 flex flex-col justify-between active:scale-95 transition-transform cursor-pointer bg-white dark:bg-zinc-900"
          onClick={() => handleNav('#nextPeriodStart', 'period')}
       >
          <div className="flex items-center gap-2 mb-2">
             <Droplet size={18} className="text-primary" />
             <span className="text-xs font-bold text-gray-400 uppercase">Месячные</span>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
             Ожидаются {formatDateRu(nextPeriodStart)}
          </div>
       </Card>

       <Card 
          className="p-4 flex flex-col justify-between active:scale-95 transition-transform cursor-pointer bg-white dark:bg-zinc-900"
          onClick={() => handleNav('#ovulation', 'ovulation')}
       >
          <div className="flex items-center gap-2 mb-2">
             <Sparkles size={18} className="text-secondary" />
             <span className="text-xs font-bold text-gray-400 uppercase">Овуляция</span>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
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
    { key: 'pain_belly', label: 'Боль', icon: Moon, type: 'symptom' },
    { key: 'mood', label: 'Настроение', icon: Zap, type: 'mood' },
    { key: 'fatigue', label: 'Энергия', icon: Activity, type: 'symptom' },
    { key: 'libido', label: 'Либидо', icon: Heart, type: 'symptom' },
  ];

  // Filter out mood to simplify quick log
  const numericItems = items.filter(i => i.type !== 'mood');

  return (
    <div className="space-y-3 pt-2">
      <div className="flex justify-between items-center px-1">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white">Быстрый лог</h3>
      </div>
      
      <div className="flex flex-wrap gap-3 px-1">
        {numericItems.map(s => {
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
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all active:scale-95",
                isActive 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400"
              )}
            >
               <s.icon size={18} className={cn(isActive ? "text-white" : "text-gray-400")} />
               <span className="text-sm font-medium">{s.label}</span>
               {isActive && val > 1 && (
                  <span className="bg-white/20 px-1.5 rounded-full text-[10px] font-bold">{val}</span>
               )}
            </button>
          );
        })}
      </div>

      <BottomSheet isOpen={!!activeItem} onClose={() => setActiveItem(null)} title="Интенсивность">
         <div className="pb-8 pt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-4 px-1 font-medium">
               <span>Нет</span><span>Слабо</span><span>Средне</span><span>Сильно</span>
            </div>
            <Slider 
               min={0} max={3} step={1}
               value={activeItem ? (log?.symptoms?.[activeItem] || 0) : 0}
               onChange={(v) => {
                  haptic('light');
                  if (activeItem) {
                     onLog(activeItem, v);
                     if (v === 0) setActiveItem(null); // Close if 0
                  }
               }}
            />
            <Button fullWidth className="mt-8" onClick={() => setActiveItem(null)}>Готово</Button>
         </div>
      </BottomSheet>
    </div>
  );
});

const AdviceTeaser = React.memo(({ phase }: { phase: string }) => {
  const navigate = useNavigate();
  // Mock content - logic for phase would go here
  const cards = [
      { id: '1', title: 'Как облегчить боль?', tag: 'Здоровье' },
      { id: '2', title: 'Питание в эти дни', tag: 'Еда' }
  ];

  return (
    <div className="space-y-3 pt-2 pb-24">
      <div 
        className="flex justify-between items-center px-1 cursor-pointer active:opacity-70"
        onClick={() => { navigate('/advice'); trackEvent('advice_teaser_open'); }}
      >
         <h3 className="text-lg font-bold text-gray-900 dark:text-white">Советы</h3>
         <ChevronRight size={20} className="text-gray-400" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 px-1 no-scrollbar snap-x">
         {cards.map(card => (
            <div 
               key={card.id}
               onClick={() => navigate(`/advice`)}
               className="min-w-[220px] bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm snap-start active:scale-95 transition-transform"
            >
               <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full mb-2 inline-block">
                  {card.tag}
               </span>
               <h4 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                  {card.title}
               </h4>
            </div>
         ))}
         <div className="w-2 shrink-0" />
      </div>
    </div>
  );
});

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logs, addLog, getPredictions } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      if (d.getDate() !== now.getDate()) setNow(d);
    }, 60000);
    return () => clearInterval(timer);
  }, [now]);

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
    trackEvent('home_main_button_click', { has_log: hasLog });
    navigate(`/log/${todayStr}`);
  }, [hasLog, todayStr, navigate]);

  useEffect(() => {
    if (!tg) return;
    tg.MainButton.show();
    tg.MainButton.setText(hasLog ? "Редактировать запись" : "Отметить самочувствие");
    tg.MainButton.setParams({
      color: tg.themeParams?.button_color || '#E97A9A',
      text_color: tg.themeParams?.button_text_color || '#FFFFFF'
    });
    tg.MainButton.onClick(handleMainBtnClick);
    return () => {
      tg.MainButton.offClick(handleMainBtnClick);
    };
  }, [hasLog, handleMainBtnClick]);

  return (
    <div className="min-h-screen bg-surface dark:bg-black px-4 overscroll-y-none">
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