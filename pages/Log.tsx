import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Chip, Card, Toggle, Slider, Toast, NumberStepper, BottomSheet } from '../components/UI';
import { useStore } from '../store';
import { haptic, parseDate, formatDate, tg, cn, diffDays } from '../lib/utils';
import { ArrowLeft, Droplet, Moon, Heart, Zap, GlassWater, Moon as SleepIcon, Plus } from 'lucide-react';
import { DayLog } from '../types';

// --- Constants ---
const SYMPTOMS_LIST = [
  { id: 'pain_belly', label: 'Боль низ живота' },
  { id: 'headache', label: 'Головная боль' },
  { id: 'chest', label: 'Тяжесть в груди' },
  { id: 'bloating', label: 'Вздутие' },
  { id: 'digestion', label: 'Проблемы ЖКТ' },
  { id: 'fatigue', label: 'Низкая энергия' },
  { id: 'acne', label: 'Акне' },
  { id: 'back_pain', label: 'Боль в спине' }
];

const MOODS = [
  { id: 'good', label: '😊 Хорошее' },
  { id: 'normal', label: '🙂 Нормальное' },
  { id: 'low', label: '😕 Пониженное' },
  { id: 'bad', label: '😣 Плохое' },
  { id: 'irritated', label: '😡 Раздражение' }
];

const CONTRACEPTION_TYPES = [
  { id: 'condom', label: 'Презерватив' },
  { id: 'ovulation', label: 'Овуляционный метод' },
  { id: 'none', label: 'Никакой' },
  { id: 'other', label: 'Другое' }
];

const DISCHARGE_COLORS = [
  { id: 'pink', color: '#F9A8D4' },    // Pink
  { id: 'red', color: '#EF4444' },     // Red
  { id: 'dark_red', color: '#991B1B' },// Dark Red
  { id: 'brown', color: '#78350F' }    // Brown
];

const INTENSITY_LABELS = { 1: 'Легкая', 2: 'Средняя', 3: 'Сильная', 4: 'Очень сильная' };

// --- Default State ---
const EMPTY_LOG: DayLog = {
  date: '',
  menstruation: { active: false },
  symptoms: {},
  mood: null,
  sleep: null,
  water: null,
  sex: { active: false },
  notes: null,
  lastModified: 0
};

// --- Sub-Components ---

const MenstruationBlock = React.memo(({ data, onChange, error }: { data: DayLog['menstruation'], onChange: (d: DayLog['menstruation']) => void, error?: boolean }) => (
  <Card className={cn("space-y-4 transition-colors", data.active ? "bg-primary/5 border-primary/20" : "")}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", data.active ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
          <Droplet size={20} fill={data.active ? "currentColor" : "none"} />
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white">Менструация</div>
          <div className="text-xs text-gray-500">{data.active ? 'Отмечено' : 'Нет выделений'}</div>
        </div>
      </div>
      <Toggle 
        checked={data.active}
        onChange={(active) => {
          haptic('medium');
          // If toggled ON, default to Light intensity (1). If OFF, reset all.
          onChange({ 
            ...data, 
            active, 
            intensity: active ? (data.intensity || 1) : undefined,
            dischargeColor: active ? (data.dischargeColor || DISCHARGE_COLORS[1].id) : undefined 
          });
        }}
      />
    </div>

    {data.active && (
      <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-4 pt-2">
        <div>
           <div className="flex justify-between text-xs font-medium text-gray-500 mb-2 px-1">
             {Object.values(INTENSITY_LABELS).map(l => <span key={l}>{l}</span>)}
           </div>
           <Slider 
             min={1} max={4} step={1}
             value={data.intensity || 1}
             onChange={(v) => { haptic('light'); onChange({ ...data, intensity: v as 1|2|3|4 }); }}
             className={cn(error && !data.intensity ? "ring-2 ring-red-500 rounded-lg" : "")}
           />
        </div>
        
        <div>
           <div className="text-xs font-medium text-gray-500 mb-2 uppercase">Цвет</div>
           <div className="flex gap-4 justify-center">
             {DISCHARGE_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { haptic('light'); onChange({ ...data, dischargeColor: c.id }); }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform active:scale-90",
                    data.dischargeColor === c.id ? "border-gray-900 dark:border-white scale-110 shadow-md" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.color }}
                  aria-label={c.id}
                />
             ))}
           </div>
        </div>
      </div>
    )}
  </Card>
));

const SymptomsBlock = React.memo(({ symptoms, onChange }: { symptoms: Record<string, number>, onChange: (k: string, v: number) => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTap = (id: string) => {
     haptic('light');
     if (symptoms[id]) {
       setEditingId(id);
     } else {
       onChange(id, 1);
     }
  };
  
  return (
    <div className="space-y-3">
       <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">Симптомы</h3>
       <div className="flex flex-wrap gap-2">
          {SYMPTOMS_LIST.map(s => {
             const level = symptoms[s.id];
             return (
               <Chip 
                  key={s.id}
                  label={s.label}
                  active={!!level}
                  color="primary"
                  onClick={() => handleTap(s.id)}
                  className={cn(!!level && "pr-2", "transition-all")}
               />
             );
          })}
       </div>

       <BottomSheet isOpen={!!editingId} onClose={() => setEditingId(null)} title="Интенсивность">
          <div className="pb-8 pt-2 px-1">
             <div className="text-center font-bold text-gray-900 dark:text-white mb-6">
               {SYMPTOMS_LIST.find(s => s.id === editingId)?.label}
             </div>
             <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                <span>Нет</span><span>Слабо</span><span>Средне</span><span>Сильно</span>
             </div>
             <Slider 
                min={0} max={3} 
                value={editingId ? (symptoms[editingId] || 0) : 0}
                onChange={(v) => {
                   if (!editingId) return;
                   haptic('light');
                   if (v === 0) {
                      onChange(editingId, 0); 
                   } else {
                      onChange(editingId, v);
                   }
                }}
             />
             <Button fullWidth size="lg" className="mt-8" onClick={() => setEditingId(null)}>Готово</Button>
          </div>
       </BottomSheet>
    </div>
  );
});

const MoodBlock = React.memo(({ value, onChange }: { value: string | null, onChange: (v: string | null) => void }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">Настроение</h3>
    <div className="flex flex-wrap gap-2">
       {MOODS.map(m => (
          <button
            key={m.id}
            onClick={() => {
               haptic('light');
               onChange(value === m.id ? null : m.id);
            }}
            className={cn(
              "px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all active:scale-95",
              value === m.id 
                 ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/30" 
                 : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300"
            )}
          >
             {m.label}
          </button>
       ))}
    </div>
  </div>
));

const HealthBlock = React.memo(({ sleep, water, onChange }: { sleep: number | null, water: number | null, onChange: (k: 'sleep'|'water', v: number|null) => void }) => (
  <div className="grid grid-cols-2 gap-4">
     <Card className="flex flex-col items-center p-4 gap-3">
        <div className="flex items-center gap-2 text-indigo-500 mb-1">
           <SleepIcon size={20} /> <span className="font-bold text-sm">Сон (ч)</span>
        </div>
        <div className="w-full">
           <NumberStepper 
             value={sleep || 0} min={0} max={24}
             onChange={(v) => { haptic('light'); onChange('sleep', v === 0 ? null : v); }}
           />
        </div>
     </Card>

     <Card className="flex flex-col items-center p-4 gap-3">
        <div className="flex items-center gap-2 text-blue-500 mb-1">
           <GlassWater size={20} /> <span className="font-bold text-sm">Вода</span>
        </div>
        <div className="w-full">
           <NumberStepper 
             value={water || 0} min={0} max={20}
             onChange={(v) => { haptic('light'); onChange('water', v === 0 ? null : v); }}
           />
        </div>
     </Card>
  </div>
));

const SexBlock = React.memo(({ data, onChange }: { data: DayLog['sex'], onChange: (d: DayLog['sex']) => void }) => (
  <div className="space-y-3">
     <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
           <Heart size={20} className="text-red-400" /> Был секс
        </div>
        <Toggle 
           checked={data.active}
           onChange={(active) => {
              haptic('medium');
              onChange({ ...data, active, contraception: active ? null : undefined, discomfort: active ? false : undefined });
           }}
        />
     </div>
     
     {data.active && (
        <Card className="animate-in slide-in-from-top-2 fade-in space-y-4 bg-gray-50 dark:bg-zinc-800 border-0">
           <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Контрацепция</div>
              <div className="flex flex-wrap gap-2">
                 {CONTRACEPTION_TYPES.map(t => (
                    <Chip 
                       key={t.id} label={t.label}
                       active={data.contraception === t.id}
                       onClick={() => { haptic('light'); onChange({ ...data, contraception: t.id }); }}
                       className="bg-white dark:bg-zinc-700 border-gray-200 dark:border-zinc-600"
                       color="secondary"
                    />
                 ))}
              </div>
           </div>
           
           <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-700 pt-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Боль или дискомфорт?</span>
              <Toggle 
                 checked={data.discomfort || false}
                 onChange={(v) => { haptic('light'); onChange({ ...data, discomfort: v }); }}
              />
           </div>
        </Card>
     )}
  </div>
));

const NotesBlock = React.memo(({ value, onChange, error }: { value: string | null, onChange: (v: string) => void, error: boolean }) => (
  <div className="space-y-2">
     <div className="flex justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Заметки</h3>
        <span className={cn("text-xs", error ? "text-red-500 font-bold" : "text-gray-400")}>
           {(value || '').length}/500
        </span>
     </div>
     <textarea 
        className={cn(
           "w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border outline-none transition-all resize-none",
           error 
             ? "border-red-500 focus:ring-1 focus:ring-red-500" 
             : "border-gray-200 dark:border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary"
        )}
        placeholder="Добавь важные детали о дне..."
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={510}
     />
  </div>
));

export const LogPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { logs, addLog, profile } = useStore();
  
  const [log, setLog] = useState<DayLog>(EMPTY_LOG);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean, msg: string, undo?: boolean }>({ visible: false, msg: '' });
  
  const lastSavedLogRef = useRef<DayLog | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);

  const isValidDate = useCallback(() => {
    if (!date) return false;
    const d = parseDate(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (d > today) return false;
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 90) return false;
    return true;
  }, [date]);

  useEffect(() => {
    if (!isValidDate()) {
        navigate('/calendar', { replace: true });
        return;
    }
    if (!date) return;
    const draftKey = `log_draft_${date}`;
    const draft = localStorage.getItem(draftKey);
    const existing = logs[date];

    if (draft) {
        setLog(JSON.parse(draft));
        setIsDraftRestored(true);
    } else if (existing) {
        setLog(JSON.parse(JSON.stringify(existing)));
    } else {
        setLog({ ...EMPTY_LOG, date });
    }
  }, [date, logs, navigate, isValidDate]);

  useEffect(() => {
    if (!date) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
       const draftKey = `log_draft_${date}`;
       localStorage.setItem(draftKey, JSON.stringify(log));
    }, 1000);
    return () => {
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [log, date]);

  const validate = useCallback(() => {
     if (log.menstruation.active && !log.menstruation.intensity) return false;
     if ((log.sleep || 0) > 24) return false;
     if ((log.water || 0) > 20) return false;
     if ((log.notes || '').length > 500) return false;
     return true;
  }, [log]);

  const handleSave = useCallback(() => {
     if (!validate() || !date) {
         haptic('error');
         return;
     }
     haptic('success');
     lastSavedLogRef.current = logs[date] || null;
     const finalLog = { ...log, lastModified: Date.now() };
     addLog(date, finalLog);
     localStorage.removeItem(`log_draft_${date}`);
     setToast({ visible: true, msg: 'Запись сохранена', undo: true });
     setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, [log, date, logs, addLog, validate]);

  const handleUndo = useCallback(() => {
     if (!date) return;
     haptic('warning');
     if (lastSavedLogRef.current) {
         addLog(date, lastSavedLogRef.current);
         setLog(lastSavedLogRef.current);
     } else {
         const empty = { ...EMPTY_LOG, date };
         addLog(date, empty);
         setLog(empty);
     }
     setToast({ visible: false, msg: '' });
  }, [date, addLog]);

  useEffect(() => {
    if (!tg) return;
    const isValid = validate();
    tg.MainButton.setText("Сохранить лог");
    if (isValid) {
       tg.MainButton.show();
       tg.MainButton.enable();
       tg.MainButton.setParams({
         color: tg.themeParams?.button_color || '#E97A9A',
         text_color: tg.themeParams?.button_text_color || '#FFFFFF'
       });
    } else {
       tg.MainButton.show();
       tg.MainButton.disable();
       tg.MainButton.setParams({
         color: tg.themeParams?.hint_color || '#999999'
       });
    }
    tg.MainButton.onClick(handleSave);
    return () => {
       tg.MainButton.offClick(handleSave);
    };
  }, [handleSave, validate]);

  const currentDate = date ? parseDate(date) : new Date();
  const lastStart = parseDate(profile.cycle.lastPeriodStart);
  const diff = diffDays(lastStart, currentDate);
  const cycleDay = (diff >= 0) ? (diff % profile.cycle.averageLength) + 1 : '-';
  const displayDate = currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  const updateSymptoms = (key: string, val: number) => {
     const next = { ...log.symptoms };
     if (val === 0) delete next[key];
     else next[key] = val;
     setLog(prev => ({ ...prev, symptoms: next }));
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-black pb-32">
       {/* Header */}
       <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/calendar')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
             <ArrowLeft size={22} />
          </button>
          <div className="text-center">
             <div className="text-gray-900 dark:text-white font-bold text-sm capitalize">{displayDate}</div>
             <div className="text-[10px] font-bold text-primary uppercase tracking-wider">День {cycleDay}</div>
          </div>
          <div className="w-8" />
       </div>

       {/* Form */}
       <div className="p-4 space-y-6 max-w-lg mx-auto">
          {isDraftRestored && (
             <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs px-3 py-2 rounded-lg text-center animate-in fade-in">
                Черновик восстановлен
             </div>
          )}

          <MenstruationBlock 
             data={log.menstruation} 
             onChange={d => setLog(p => ({ ...p, menstruation: d }))}
             error={log.menstruation.active && !log.menstruation.intensity}
          />

          <SymptomsBlock symptoms={log.symptoms} onChange={updateSymptoms} />
          <MoodBlock value={log.mood} onChange={v => setLog(p => ({ ...p, mood: v }))} />
          <HealthBlock sleep={log.sleep} water={log.water} onChange={(k, v) => setLog(p => ({ ...p, [k]: v }))} />
          <SexBlock data={log.sex} onChange={d => setLog(p => ({ ...p, sex: d }))} />
          
          <NotesBlock 
             value={log.notes} 
             onChange={v => setLog(p => ({ ...p, notes: v }))}
             error={(log.notes || '').length > 500}
          />
       </div>

       {/* Undo Toast */}
       <Toast 
          isVisible={toast.visible} 
          message={toast.msg} 
          actionLabel={toast.undo ? "Отменить" : undefined}
          onAction={handleUndo}
       />
       
       {/* Dev Save Button (if no TG) */}
       {!tg?.initData && (
          <div className="fixed bottom-6 left-4 right-4 z-20">
             <Button fullWidth size="xl" onClick={handleSave} disabled={!validate()}>
                Сохранить лог (Dev)
             </Button>
          </div>
       )}
    </div>
  );
};