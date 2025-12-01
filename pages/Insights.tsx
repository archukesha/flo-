
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, ReferenceLine, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { Card, Button } from '../components/UI';
import { useStore } from '../store';
import { detectCycles, calculateHeatmap, calculateCorrelation, CycleData } from '../lib/insightsEngine';
import { formatDate } from '../lib/utils';
import { Lock, TrendingUp, Activity, Moon, Grid } from 'lucide-react';
import { cn, haptic } from '../lib/utils';

// --- Constants ---
const SYMPTOM_LABELS: Record<string, string> = {
    pain_belly: 'Боль (живот)',
    headache: 'Головная боль',
    fatigue: 'Усталость',
    mood: 'Настроение',
    acne: 'Акне',
    bloating: 'Вздутие'
};

export const Insights: React.FC = () => {
  const navigate = useNavigate();
  const { logs, profile } = useStore();
  const isPro = profile.subscription === 'pro';

  // Filters
  const [periodFilter, setPeriodFilter] = useState<'3m' | '6m' | '12m'>('6m');
  const [completedOnly, setCompletedOnly] = useState(true);

  // --- Engine Calculations ---
  const cycles = useMemo(() => {
    return detectCycles(logs, profile.cycle.lastPeriodStart);
  }, [logs, profile.cycle.lastPeriodStart]);

  const filteredCycles = useMemo(() => {
    let count = periodFilter === '3m' ? 3 : periodFilter === '6m' ? 6 : 12;
    // Take last N cycles
    const sliced = cycles.slice(-count);
    return completedOnly ? sliced : sliced; // Engine currently only returns completed
  }, [cycles, periodFilter, completedOnly]);

  const stats = useMemo(() => {
    if (filteredCycles.length === 0) return { avgLen: 28, avgPeriod: 5, variance: [] };
    
    const totalLen = filteredCycles.reduce((acc, c) => acc + c.length, 0);
    const totalPeriod = filteredCycles.reduce((acc, c) => acc + c.periodLength, 0);
    const avgLen = totalLen / filteredCycles.length;
    
    // Variance per cycle
    const varianceData = filteredCycles.map((c, i) => ({
        name: `Ц${i+1}`,
        val: Math.round((c.length - avgLen) * 10) / 10,
        length: c.length
    }));

    return {
        avgLen: Math.round(avgLen),
        avgPeriod: Math.round(totalPeriod / filteredCycles.length),
        variance: varianceData
    };
  }, [filteredCycles]);

  const heatmapData = useMemo(() => {
    return calculateHeatmap(filteredCycles, stats.avgLen + 2);
  }, [filteredCycles, stats.avgLen]);

  const correlation = useMemo(() => {
    return calculateCorrelation(filteredCycles);
  }, [filteredCycles]);

  // --- Render Helpers ---

  // Empty State
  if (cycles.length < 2) {
    return (
      <div className="min-h-screen bg-surface dark:bg-black p-6 flex flex-col items-center justify-center text-center space-y-6">
         <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <TrendingUp size={40} />
         </div>
         <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ещё немного данных</h2>
            <p className="text-gray-500 max-w-xs mx-auto">
               Чтобы построить графики, нам нужно хотя бы 2 завершённых цикла. Продолжай вести лог!
            </p>
         </div>
         <Button onClick={() => navigate('/log/' + formatDate(new Date()))}>Добавить запись</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-black p-4 space-y-6 pb-28 pt-4">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Инсайты</h1>
        
        {/* Filter Chips */}
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
           {(['3m', '6m', '12m'] as const).map(f => (
              <button
                 key={f}
                 onClick={() => { haptic('light'); setPeriodFilter(f); }}
                 className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                    periodFilter === f 
                       ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm" 
                       : "text-gray-400"
                 )}
              >
                 {f === '3m' ? '3 Мес' : f === '6m' ? '6 Мес' : '1 Год'}
              </button>
           ))}
        </div>
      </div>

      {/* 1. Cycle Length (Line Chart) */}
      <Card>
         <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" size={20} />
            <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Длительность цикла</h3>
               <p className="text-xs text-gray-500">Среднее: {stats.avgLen} дн.</p>
            </div>
         </div>
         <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={stats.variance} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line 
                     type="monotone" 
                     dataKey="length" 
                     stroke="#E97A9A" 
                     strokeWidth={3} 
                     dot={{ fill: '#E97A9A', strokeWidth: 2, r: 4, stroke: '#fff' }}
                     activeDot={{ r: 6 }}
                     isAnimationActive={true}
                  />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </Card>

      {/* 2. Variance (Bar Chart) */}
      <Card>
         <div className="flex items-center gap-2 mb-4">
            <Activity className="text-secondary" size={20} />
            <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Стабильность</h3>
               <p className="text-xs text-gray-500">Отклонения от нормы</p>
            </div>
         </div>
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.variance} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                  <ReferenceLine y={0} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="val" fill="#B9A2E1" radius={[4, 4, 4, 4]} barSize={20}>
                     {stats.variance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.val > 0 ? '#B9A2E1' : '#F59E0B'} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </Card>

      {/* 3. Symptom Heatmap */}
      <Card className="overflow-hidden">
         <div className="flex items-center gap-2 mb-4">
            <Grid className="text-gray-500" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-white">Карта симптомов</h3>
         </div>
         
         <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="min-w-[400px]">
               {/* Day Header */}
               <div className="flex mb-2">
                  <div className="w-24 shrink-0" />
                  {Array.from({ length: 30 }).map((_, i) => (
                     <div key={i} className="flex-1 text-[8px] text-gray-400 text-center">
                        {(i+1) % 5 === 0 ? i+1 : ''}
                     </div>
                  ))}
               </div>

               {/* Rows */}
               {Object.keys(heatmapData).map((symptomKey, idx) => {
                  if (idx > 2 && !isPro) return null; // Hide rows if not pro

                  return (
                     <div key={symptomKey} className="flex items-center mb-1.5 h-6">
                        <div className="w-24 shrink-0 text-xs font-medium text-gray-500 truncate pr-2">
                           {SYMPTOM_LABELS[symptomKey] || symptomKey}
                        </div>
                        <div className="flex-1 flex gap-[2px] h-full">
                           {heatmapData[symptomKey].map((val, dIdx) => (
                              <div 
                                 key={dIdx}
                                 className="flex-1 rounded-[2px]"
                                 style={{
                                    backgroundColor: `rgba(233, 122, 154, ${Math.min(val / 3, 1)})`,
                                    opacity: val > 0 ? 1 : 0.05
                                 }} 
                              />
                           ))}
                        </div>
                     </div>
                  );
               })}

               {/* Pro Blur for Heatmap */}
               {!isPro && Object.keys(heatmapData).length > 3 && (
                  <div className="relative h-16 mt-2 overflow-hidden rounded-lg">
                      <div className="absolute inset-0 blur-sm flex flex-col gap-2">
                         <div className="h-6 bg-gray-100 dark:bg-zinc-800 w-full" />
                         <div className="h-6 bg-gray-100 dark:bg-zinc-800 w-full" />
                      </div>
                      <ProOverlay />
                  </div>
               )}
            </div>
         </div>
         <div className="flex justify-end gap-2 mt-2">
            {[1, 2, 3].map(i => (
               <div key={i} className="w-3 h-3 rounded-[2px] bg-primary" style={{ opacity: i * 0.33 }} />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">Интенсивность</span>
         </div>
      </Card>

      {/* 4. Correlations (Scatter) - PRO ONLY */}
      <div className="relative">
         <Card className={cn(!isPro && "blur-sm select-none opacity-60")}>
            <div className="flex items-center gap-2 mb-4">
               <Moon className="text-indigo-500" size={20} />
               <h3 className="font-bold text-gray-900 dark:text-white">Сон vs Самочувствие</h3>
            </div>
            
            <div className="h-52 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis type="number" dataKey="x" name="Сон" unit="ч" tick={{fontSize:10}} />
                     <YAxis type="number" dataKey="y" name="Симптомы" tick={{fontSize:10}} />
                     <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                     <Scatter name="Days" data={filteredCycles.flatMap(c => c.logs.map(l => ({
                        x: l.sleep || 0,
                        y: Object.values(l.symptoms).reduce((a, b) => a + b, 0)
                     })).filter(p => p.x > 0))} fill="#8884d8" />
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
            {correlation !== null && (
               <div className="mt-2 text-xs text-gray-500 text-center">
                  Коэффициент корреляции: <span className="font-bold">{correlation.toFixed(2)}</span>
               </div>
            )}
         </Card>
         
         {!isPro && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
               <ProOverlay />
            </div>
         )}
      </div>

    </div>
  );
};

// Reusable Pro Overlay
const ProOverlay = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-700 text-center max-w-[200px]">
           <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
              <Lock size={16} />
           </div>
           <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">Доступно в PRO</p>
           <Button size="sm" fullWidth onClick={() => navigate('/paywall')}>Открыть</Button>
        </div>
    );
};
