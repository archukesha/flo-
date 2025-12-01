import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { NumberStepper, Input, Button, Chip } from '../components/UI';
import { haptic, tg, cn } from '../lib/utils';
import { Calendar, Baby, ShieldCheck, AlertCircle, Heart, Bell, Check, ExternalLink } from 'lucide-react';

// --- Localization ---
const translations = {
  welcome_title: "Помогу отслеживать цикл и самочувствие",
  step1_title: "Последние месячные",
  step1_desc: "Выбери первый день последней менструации.",
  step2_title: "Длина цикла",
  step2_desc: "Количество дней между началами месячных.",
  step2_hint: "Если не уверена — оставь 28",
  step3_title: "Длительность",
  step3_desc: "Сколько дней обычно длится менструация?",
  step4_title: "Твоя цель",
  step4_desc: "Мы адаптируем советы под твой выбор.",
  step5_title: "Согласия",
  step5_desc: "Финальный шаг перед началом.",
  privacy_local: "Локальное хранение",
  privacy_text: "Твои данные шифруются и хранятся только на этом устройстве.",
  consent_privacy: "Я согласна с Политикой конфиденциальности",
  consent_notifications: "Получать полезные напоминания",
  link_privacy: "Политика конфиденциальности",
  btn_start: "Начнём",
  btn_next: "Далее",
  btn_finish: "Готово",
  err_date_invalid: "Некорректная дата",
  err_date_future: "Дата не может быть позже сегодняшней",
  err_cycle_range: "Цикл должен быть от 21 до 45 дней",
  err_period_range: "Длительность от 1 до 8 дней",
  goal_regularity: "Следить за циклом",
  goal_conception: "Планировать беременность",
  goal_wellbeing: "Улучшить самочувствие",
  goal_desc_regularity: "Отслеживай цикл и получай точные прогнозы.",
  goal_desc_conception: "Повысь шансы забеременеть, зная дни овуляции.",
  goal_desc_wellbeing: "Пойми своё тело и контролируй симптомы.",
  btn_skip: "Пропустить",
  units_days: "дней",
  preset_today: "Сегодня",
  preset_yesterday: "Вчера",
  preset_3days: "3 дня назад"
};

const t = (key: keyof typeof translations) => translations[key];

// --- Types & Constants ---

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  lastPeriod: string;
  cycleLength: number;
  periodLength: number;
  goal?: 'regularity' | 'conception' | 'wellbeing';
  consent: boolean;
  reminderConsent: boolean;
}

const STORAGE_KEY = 'flo_onboarding_draft';

const INITIAL_DATA: OnboardingData = {
  lastPeriod: '',
  cycleLength: 28,
  periodLength: 5,
  goal: undefined,
  consent: false,
  reminderConsent: false,
};

// --- Helper Components ---
const CheckboxRow: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  hasError?: boolean;
  rightElement?: React.ReactNode;
}> = ({ checked, onChange, label, hasError, rightElement }) => (
  <div 
    className={cn(
      "flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer border",
      hasError ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800" : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 active:bg-gray-50 dark:active:bg-zinc-800"
    )}
    onClick={onChange}
  >
    <div className={cn(
      "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
      checked 
        ? "bg-primary border-primary" 
        : hasError ? "border-red-300 bg-white" : "border-gray-300 dark:border-gray-600 bg-transparent"
    )}>
      {checked && <Check size={14} className="text-white" strokeWidth={3} />}
    </div>
    <div className="flex-1">
       <span className={cn("text-sm font-medium", hasError ? "text-red-600" : "text-gray-900 dark:text-white")}>{label}</span>
       {rightElement && <div className="mt-1">{rightElement}</div>}
    </div>
  </div>
);

// --- Component ---

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setProfile = useStore((state) => state.setProfile);
  const profile = useStore((state) => state.profile);
  
  // Handle deep-link /onboarding?force=1
  const isForceMode = searchParams.get('force') === '1';

  // State initialization
  const [step, setStep] = useState<OnboardingStep>(() => {
    if (isForceMode) return 0;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved).step || 0) : 0;
  });

  const [formData, setFormData] = useState<OnboardingData>(() => {
    if (isForceMode) return INITIAL_DATA;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).data : INITIAL_DATA;
  });

  const [error, setError] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data: formData }));
  }, [step, formData]);

  // --- Metrics: Start Timestamp ---
  useEffect(() => {
    if (step === 0 && !localStorage.getItem('onboarding_started_at')) {
       localStorage.setItem('onboarding_started_at', Date.now().toString());
    }
  }, [step]);

  // --- Redirect if already onboarded ---
  useEffect(() => {
    if (profile.isOnboarded && !isForceMode) {
      navigate('/home', { replace: true });
    }
  }, [profile.isOnboarded, isForceMode, navigate]);

  // --- Helpers ---
  const getLocalISODate = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  const setDatePreset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateStr = getLocalISODate(d);
    setFormData(prev => ({ ...prev, lastPeriod: dateStr }));
    haptic('light');
    if (error) setError(null);
  };

  const openPrivacy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tg?.openLink) {
        tg.openLink('https://example.com/privacy'); // Replace with actual link
    } else {
        window.open('https://example.com/privacy', '_blank');
    }
  };

  // --- Validation Logic ---
  const validateStep = useCallback((currentStep: number, data: OnboardingData): boolean => {
    switch (currentStep) {
      case 0: return true;
      case 1:
        if (!data.lastPeriod) return false;
        const selected = new Date(data.lastPeriod);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        selected.setHours(0,0,0,0);
        return !isNaN(selected.getTime()) && selected <= today;
      case 2: return data.cycleLength >= 21 && data.cycleLength <= 45;
      case 3: return data.periodLength >= 1 && data.periodLength <= 8;
      case 4: return true;
      case 5: return data.consent;
      default: return false;
    }
  }, []);

  // Effect to update error state visibly
  useEffect(() => {
    if (step === 1 && formData.lastPeriod) {
       const selected = new Date(formData.lastPeriod);
       const today = new Date();
       today.setHours(0,0,0,0);
       selected.setHours(0,0,0,0);
       if (selected > today) setError(t('err_date_future'));
       else setError(null);
    } else {
      setError(null);
    }
  }, [step, formData.lastPeriod]);


  // --- Navigation & Completion ---
  const handleNext = useCallback(() => {
    if (!validateStep(step, formData)) {
      haptic('error');
      if (step === 1) setError(t('err_date_future'));
      return;
    }

    haptic('light');

    if (step < 5) {
      setStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      completeOnboarding();
    }
  }, [step, formData, validateStep]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      haptic('light');
      setStep((prev) => (prev - 1) as OnboardingStep);
    }
  }, [step]);

  const completeOnboarding = () => {
    haptic('success');
    
    // 1. Metric
    localStorage.setItem('onboarding_finished_at', Date.now().toString());
    
    // 2. Save Profile
    // Predictions (ovulation, fertileWindow, nextPeriod) are derived dynamically 
    // in store.ts based on these cycle parameters.
    setProfile({
      isOnboarded: true,
      cycle: {
        lastPeriodStart: formData.lastPeriod,
        periodLength: formData.periodLength,
        averageLength: formData.cycleLength
      },
      goal: formData.goal,
      reminderConsent: formData.reminderConsent,
      subscription: 'free'
    });

    // 3. Cleanup Draft
    localStorage.removeItem(STORAGE_KEY);
    
    // 4. Hide MainButton (it might stay visible if not hidden explicitly)
    if (tg) {
        tg.MainButton.hide();
    }

    // 5. Navigate
    navigate('/home', { replace: true });
  };

  // --- Telegram UI Integration ---
  useEffect(() => {
    if (!tg) return;
    if (step > 0) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    } else {
      tg.BackButton.hide();
    }
    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [step, handleBack]);

  useEffect(() => {
    if (!tg) return;

    const isValid = validateStep(step, formData);
    const btnText = step === 0 ? t('btn_start') : step === 5 ? t('btn_finish') : t('btn_next');
    tg.MainButton.setText(btnText);

    // Block Step 1 on error
    const hasError = step === 1 && error;
    // Block Step 5 only if consent is strictly false (though usually handled by click)
    const isConsentMissing = step === 5 && !formData.consent;

    if (isValid && !hasError) {
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

    tg.MainButton.onClick(handleNext);
    return () => {
      tg.MainButton.offClick(handleNext);
    };
  }, [step, formData, handleNext, validateStep, error]);


  // --- Render Steps ---
  const animationClass = "animate-in slide-in-from-right fade-in duration-[240ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]";

  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <div className={cn("flex flex-col h-full justify-center items-center text-center space-y-8 max-h-[520px]:space-y-4 py-8 max-h-[520px]:py-2", animationClass)}>
             {/* Compact mode: hide illustration */}
             <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-primary/10 via-surface to-secondary/10 flex items-center justify-center max-h-[520px]:hidden">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl animate-pulse" />
             </div>
          </div>
        );

      case 1:
        const todayStr = getLocalISODate(new Date());
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 120);
        const minDateStr = getLocalISODate(minDate);

        return (
          <div className={cn("space-y-8 max-h-[520px]:space-y-4 pt-4", animationClass)}>
             <p className="text-gray-500 text-base">{t('step1_desc')}</p>
             <div className="flex gap-2">
                <Chip 
                  label={t('preset_today')} 
                  onClick={() => setDatePreset(0)} 
                  active={formData.lastPeriod === todayStr}
                  className="flex-1 justify-center"
                />
                <Chip 
                  label={t('preset_yesterday')} 
                  onClick={() => setDatePreset(1)} 
                  active={formData.lastPeriod === getLocalISODate(new Date(Date.now() - 86400000))}
                  className="flex-1 justify-center"
                />
                <Chip 
                  label={t('preset_3days')} 
                  onClick={() => setDatePreset(3)} 
                  active={false}
                  className="flex-1 justify-center"
                />
             </div>
             {/* Spacing updated to gap-1 for "± 4px" compliance */}
             <div className="flex flex-col gap-1">
                <Input 
                  type="date" 
                  aria-label={t('step1_title')}
                  value={formData.lastPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastPeriod: e.target.value }))}
                  className={cn(
                    "text-center text-xl font-medium h-16 transition-colors appearance-none",
                    error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  )}
                  max={todayStr}
                  min={minDateStr}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center justify-center gap-2 text-red-500 text-xs animate-in slide-in-from-top-1">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                  </div>
                )}
             </div>
          </div>
        );

      case 2:
        return (
          <div className={cn("space-y-6 max-h-[520px]:space-y-4 pt-4", animationClass)}>
             <p className="text-gray-500 text-base">{t('step2_desc')}</p>
             <div className="py-8 max-h-[520px]:py-2">
               <NumberStepper 
                  value={formData.cycleLength}
                  min={21}
                  max={45}
                  onChange={(v) => {
                      haptic('light');
                      setFormData(prev => ({ ...prev, cycleLength: v }));
                  }}
                  label={t('units_days')}
                />
             </div>
             <p className="text-center text-sm text-gray-400">{t('step2_hint')}</p>
          </div>
        );

      case 3:
        return (
          <div className={cn("space-y-6 max-h-[520px]:space-y-4 pt-4", animationClass)}>
             <p className="text-gray-500 text-base">{t('step3_desc')}</p>
             <div className="py-8 max-h-[520px]:py-2">
               <NumberStepper 
                  value={formData.periodLength}
                  min={1}
                  max={8}
                  onChange={(v) => {
                      haptic('light');
                      setFormData(prev => ({ ...prev, periodLength: v }));
                  }}
                  label={t('units_days')}
                />
             </div>
          </div>
        );

      case 4:
        const goals = [
            { id: 'regularity', label: t('goal_regularity'), desc: t('goal_desc_regularity'), icon: Calendar },
            { id: 'conception', label: t('goal_conception'), desc: t('goal_desc_conception'), icon: Baby },
            { id: 'wellbeing', label: t('goal_wellbeing'), desc: t('goal_desc_wellbeing'), icon: Heart }
        ];
        const currentGoal = goals.find(g => g.id === formData.goal);

        return (
          <div className={cn("space-y-6 max-h-[520px]:space-y-4 pt-4", animationClass)}>
             <p className="text-gray-500 text-base">{t('step4_desc')}</p>
             <div className="flex flex-wrap gap-3">
                {goals.map((option) => (
                   <Chip 
                      key={option.id}
                      label={option.label}
                      active={formData.goal === option.id}
                      onClick={() => {
                        haptic('light');
                        setFormData(prev => ({ ...prev, goal: option.id as any }));
                      }}
                      className="text-base py-3 px-5"
                   />
                ))}
                <Chip 
                    label={t('btn_skip')}
                    active={formData.goal === undefined}
                    onClick={() => {
                         haptic('light');
                         setFormData(prev => ({ ...prev, goal: undefined }));
                    }}
                    className={cn(
                        "text-base py-3 px-5",
                        formData.goal === undefined 
                            ? "bg-gray-200 text-gray-800 border-gray-200 dark:bg-zinc-700 dark:text-white dark:border-zinc-700" 
                            : "bg-surface text-gray-500 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400"
                    )}
                    color="primary" 
                />
             </div>
             <div className="mt-8 min-h-[80px] max-h-[520px]:mt-2">
                 {currentGoal ? (
                     <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <div className="flex items-start gap-3">
                             <div className="mt-1 text-primary"><currentGoal.icon size={20} /></div>
                             <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">{currentGoal.desc}</p>
                         </div>
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2 opacity-60">
                         <p className="text-sm">Цель не выбрана</p>
                     </div>
                 )}
             </div>
          </div>
        );

      case 5:
        return (
          <div className={cn("space-y-6 max-h-[520px]:space-y-4 pt-4", animationClass)}>
             <p className="text-gray-500 text-base">{t('step5_desc')}</p>
             
             <div className="space-y-4 max-h-[520px]:space-y-2">
                 {/* Mandatory Privacy Checkbox */}
                 <CheckboxRow 
                    label={t('consent_privacy')}
                    checked={formData.consent}
                    onChange={() => {
                        haptic('medium');
                        setFormData(prev => ({ ...prev, consent: !prev.consent }));
                    }}
                    hasError={!formData.consent && tg?.MainButton?.isDisabled === false} // Only visually error if user tried to click finish? 
                    // Better: Error if button disabled? No. Just show error if not checked.
                    // But typically we don't show error until interaction.
                    rightElement={
                        <button onClick={openPrivacy} className="text-xs text-primary flex items-center gap-1 mt-0.5">
                            {t('link_privacy')} <ExternalLink size={10} />
                        </button>
                    }
                 />

                 {/* Optional Reminder Checkbox */}
                 <CheckboxRow 
                    label={t('consent_notifications')}
                    checked={formData.reminderConsent}
                    onChange={() => {
                        haptic('light');
                        setFormData(prev => ({ ...prev, reminderConsent: !prev.reminderConsent }));
                    }}
                    rightElement={<div className="text-xs text-gray-400">Бот пришлет уведомление</div>}
                 />
             </div>

             <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl mt-4 max-h-[520px]:mt-2">
                <ShieldCheck className="text-gray-400 mt-1 shrink-0" size={20} />
                <p className="text-xs text-gray-500 leading-relaxed">
                   {t('privacy_text')}
                </p>
             </div>
          </div>
        );
    }
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 0: return t('welcome_title');
      case 1: return t('step1_title');
      case 2: return t('step2_title');
      case 3: return t('step3_title');
      case 4: return t('step4_title');
      case 5: return t('step5_title');
      default: return "";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface dark:bg-black overflow-hidden overscroll-none">
      <header className="shrink-0 px-6 pt-4 pb-4 bg-surface dark:bg-black z-10">
        <div className="flex space-x-1.5 h-1.5 w-full mb-6 max-h-[520px]:mb-3">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn("flex-1 rounded-full transition-all duration-500", i <= step ? "bg-primary" : "bg-gray-200 dark:bg-zinc-800")} />
            ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-in fade-in duration-200">
          {getHeaderTitle()}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 no-scrollbar pb-32">
         {renderContent()}
         
         {/* FALLBACK BUTTON FOR DEV */}
         {!tg?.initData && (
             <div className="mt-8 animate-in fade-in duration-500">
                 <Button 
                    fullWidth 
                    size="xl" 
                    variant="primary"
                    onClick={handleNext}
                    disabled={(step === 5 && !formData.consent) || (step === 1 && !!error) || (step === 1 && !formData.lastPeriod)}
                 >
                    {step === 0 ? t('btn_start') : step === 5 ? t('btn_finish') : t('btn_next')}
                 </Button>
                 <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">Dev Mode</span>
                 </div>
             </div>
         )}
      </main>

      <div className="shrink-0 h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};