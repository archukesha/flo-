import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Edit2, Calendar as CalendarIcon, Droplet } from 'lucide-react';
import { Button, BottomSheet, Chip } from '../components/UI';
import { isSameDay, cn, formatDate, haptic, parseDate, addMonths, subMonths, startOfWeek, diffDays } from '../lib/utils';
import { useStore } from '../store';
import { DayLog } from '../types';

interface DayStatus {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  hasLog: boolean;
  log: DayLog | undefined;
  cycleDay: number | null;
}

const MiniCycleRing = React.memo(({ profile }: { profile: any }) => {
  const radius = 28;
  const strokeWidth = 4;
  const center = 32;
  const circumference = 2 * Math.PI * radius;
  const { averageLength, periodLength } = profile.cycle;
  
  const periodDash = (periodLength / averageLength) * circumference;
  const ovulationDay = averageLength - 14;
  const fertileStart = ovulationDay - 2;
  const fertileLength = 5;
  const fertileDash = (fertileLength / averageLength) * circumference;
  const fertileRotation = ((fertileStart - 1) / averageLength) * 360 - 90;
  const ovulationRotation = ((ovulationDay - 1) / averageLength) * 360 - 90;

  return (
    <div className="w-16 h-16 relative flex items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-gray-100 dark:stroke-zinc-800" />
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${periodDash} ${circumference}`}
          className="stroke-primary opacity-60"
        />
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${fertileDash} ${circumference}`}
          strokeDashoffset={0}
          className="stroke-secondary opacity-60"
          transform={`rotate(${fertileRotation + 90} ${center} ${center})`}
        />
        <g transform={`rotate(${ovulationRotation + 90} ${center} ${center})`}>
          <circle cx={center + radius} cy={center} r={2} className="fill-secondary" />
        </g>
      </svg>
    </div>
  );
});

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logs, profile } = useStore();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const qMonth = searchParams.get('month');
    if (qMonth) {
        const d = parseDate(qMonth + '-01');
        if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    setSearchParams({ month: `${y}-${m}` }, { replace: true });
  }, [currentMonth, setSearchParams]);

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo && !selectedDate) {
        const d = parseDate(scrollTo);
        if (!isNaN(d.getTime())) {
            setSelectedDate(d);
            if (d.getMonth() !== currentMonth.getMonth() || d.getFullYear() !== currentMonth.getFullYear()) {
                setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
            }
        }
    }
  }, [searchParams]);

  const days = useMemo<DayStatus[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = startOfWeek(firstDayOfMonth, 1);
    
    const gridDays: DayStatus[] = [];
    const iterator = new Date(startDate);
    const lastPeriodDate = parseDate(profile.cycle.lastPeriodStart);
    const avgCycle = profile.cycle.averageLength;
    const periodLen = profile.cycle.periodLength;

    for (let i = 0; i < 42; i++) {
        const d = new Date(iterator);
        const dateStr = formatDate(d);
        const log = logs[dateStr];
        
        const timeDiff = d.getTime() - lastPeriodDate.getTime();
        const diffDaysCount = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        let cycleDay = null;
        let isPredictedPeriod = false;
        let isFertile = false;
        let isOvulation = false;

        if (diffDaysCount >= 0) {
            cycleDay = (diffDaysCount % avgCycle) + 1;
            const today = new Date();
            const daysFromToday = diffDays(today, d);
            const isFuture = d > today;

            if (!isFuture || daysFromToday <= 60) {
                if (cycleDay <= periodLen) isPredictedPeriod = true;
                const ovulationDay = avgCycle - 14;
                if (cycleDay === ovulationDay) isOvulation = true;
                if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 2) isFertile = true;
            }
        }

        const isPeriod = !!log?.menstruation?.active;
        if (isPeriod) isPredictedPeriod = false;
        
        const hasLog = !!log && (
            isPeriod || 
            (log.symptoms && Object.keys(log.symptoms).length > 0) || 
            !!log.mood || 
            !!log.notes ||
            !!log.sex?.active
        );

        gridDays.push({
            date: d,
            isCurrentMonth: d.getMonth() === month,
            isToday: isSameDay(d, new Date()),
            isPeriod,
            isPredictedPeriod,
            isFertile,
            isOvulation,
            hasLog,
            log,
            cycleDay: isPeriod ? (cycleDay || 1) : cycleDay
        });
        iterator.setDate(iterator.getDate() + 1);
    }
    return gridDays;
  }, [currentMonth, logs, profile.cycle]);

  const handlePrev = () => { setCurrentMonth(subMonths(currentMonth, 1)); haptic('light'); };
  const handleNext = () => { setCurrentMonth(addMonths(currentMonth, 1)); haptic('light'); };
  
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? handleNext() : handlePrev(); }
    touchStart.current = null;
  };

  const renderDayDetails = () => {
      if (!selectedDate) return null;
      const dateStr = formatDate(selectedDate);
      const log = logs[dateStr];
      const lastStart = parseDate(profile.cycle.lastPeriodStart);
      const diff = diffDays(lastStart, selectedDate);
      const cycleDay = (diff >= 0) ? (diff % profile.cycle.averageLength) + 1 : null;
      
      return (
        <div className="space-y-6 pb-6">
           <div className="flex items-center gap-3">
               {cycleDay && <Chip label={`День цикла: ${cycleDay}`} className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300" />}
               {selectedDate > new Date() && <Chip label="Будущее" className="bg-blue-50 text-blue-600 border-blue-100" />}
           </div>

           {log ? (
               <div className="space-y-4">
                   {log.menstruation?.active && (
                       <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                           <div className="flex items-center gap-3">
                               <Droplet className="text-primary" size={20} />
                               <span className="font-bold text-gray-900 dark:text-white">Менструация</span>
                           </div>
                           <div className="flex gap-1">
                               {[1,2,3,4].map(i => (
                                  <div key={i} className={cn("w-2 h-6 rounded-full", (log.menstruation.intensity || 0) >= i ? "bg-primary" : "bg-gray-200 dark:bg-zinc-700")} />
                              ))}
                           </div>
                       </div>
                   )}
                   {log.symptoms && Object.entries(log.symptoms).map(([key, val]) => (
                       !!val && <div key={key} className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800"><span className="capitalize text-gray-700 dark:text-gray-300">{key}</span><span className="font-medium">{String(val)}</span></div>
                   ))}
                   {log.mood && <div className="flex justify-between py-2"><span className="text-gray-700">Настроение</span><span className="font-medium">{log.mood}</span></div>}
                   {log.notes && <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl text-sm italic text-gray-600">"{log.notes}"</div>}
               </div>
           ) : (
               <div className="text-center py-8 text-gray-400"><CalendarIcon size={48} className="mx-auto mb-3 opacity-20" /><p className="text-sm">Нет записей</p></div>
           )}
           <Button fullWidth size="xl" onClick={() => { haptic('light'); navigate(`/log/${formatDate(selectedDate)}`); }}>
               <Edit2 size={18} className="mr-2" /> {log ? 'Править запись' : 'Добавить запись'}
           </Button>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-black pt-safe-top flex flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
         <Button variant="ghost" onClick={handlePrev}><ChevronLeft size={24}/></Button>
         <div className="flex flex-col items-center gap-1">
             <MiniCycleRing profile={profile} />
             <h2 className="text-lg font-bold capitalize text-gray-900 dark:text-white">
                {currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
             </h2>
         </div>
         <Button variant="ghost" onClick={handleNext}><ChevronRight size={24}/></Button>
      </div>

      <div className="px-4 py-3 flex justify-center gap-4 text-[10px] text-gray-500 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary" /> Менструация</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-primary" /> Прогноз</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-secondary/20" /> Фертильность</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-secondary" /> Овуляция</div>
      </div>

      <div className="flex-1 px-2 pb-24">
         <div className="grid grid-cols-7 mb-2">
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
         </div>
         <div className="grid grid-cols-7 gap-1 auto-rows-[1fr]">
            {days.map((day, idx) => {
                let bgClass = "bg-transparent";
                let textClass = day.isCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-400 opacity-40";
                
                // Prioritize visuals: Period > Predicted Period > Fertile
                if (day.isPeriod) { 
                    bgClass = "bg-primary text-white font-medium"; 
                    textClass = "text-white";
                } else if (day.isPredictedPeriod) { 
                    bgClass = "border border-primary text-primary font-medium"; 
                } else if (day.isFertile) {
                    bgClass = "bg-secondary/20 text-secondary-dark";
                }

                if (day.isToday && !day.isPeriod) { 
                    textClass = "text-primary font-extrabold"; 
                    if (!day.isPredictedPeriod) bgClass += " ring-1 ring-primary ring-inset"; 
                }

                const showLogDot = day.hasLog && !day.isPeriod;

                return (
                    <div key={idx} onClick={() => { haptic('light'); setSelectedDate(day.date); }}
                        className={cn("relative aspect-[4/5] sm:aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 sm:pt-2 transition-all active:scale-95 border-2 border-transparent", bgClass, textClass)}
                    >
                        <span className="text-sm z-10">{day.date.getDate()}</span>
                        {day.isOvulation && !day.isPeriod && <div className="absolute top-[50%] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-secondary z-0" />}
                        {showLogDot && (
                            <div className="absolute bottom-1.5 flex gap-0.5">
                                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                            </div>
                        )}
                    </div>
                );
            })}
         </div>
      </div>

      <BottomSheet isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate?.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}>
        {renderDayDetails()}
      </BottomSheet>
    </div>
  );
};