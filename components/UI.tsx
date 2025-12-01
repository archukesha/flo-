
import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { ChevronRight, X } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, variant = 'primary', size = 'md', fullWidth, children, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none btn-press relative overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-[#E97A9A] text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 border border-white/10",
    secondary: "bg-secondary text-white shadow-lg shadow-secondary/30",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-gray-600 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-white/10",
    glass: "bg-white/80 dark:bg-black/50 backdrop-blur-md border border-white/20 text-gray-900 dark:text-white shadow-sm"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-5 text-sm tracking-wide",
    lg: "h-13 px-6 text-base",
    xl: "h-14 px-8 text-lg"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)} 
      {...props}
    >
      {/* Subtle shine effect for primary buttons */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};

// --- Card (Glassmorphic) ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("glass-card rounded-[24px] p-5", className)} {...props}>
    {children}
  </div>
);

// --- Chip ---
interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: 'primary' | 'secondary';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, active, onClick, color = 'primary', className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border btn-press",
        active 
          ? color === 'primary' 
            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25" 
            : "bg-secondary text-white border-secondary shadow-lg shadow-secondary/25"
          : "bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm text-gray-600 border-transparent hover:bg-white/80 dark:hover:bg-zinc-800 dark:text-gray-300",
        className
      )}
    >
      {label}
    </button>
  );
};

// --- Toggle ---
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, className }) => (
  <label className={cn("relative inline-flex items-center cursor-pointer tap-highlight-transparent", className)}>
    <input 
      type="checkbox" 
      className="sr-only peer" 
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className={cn(
      "w-12 h-7 bg-gray-200/80 peer-focus:outline-none rounded-full peer dark:bg-gray-700/80 transition-all duration-300 peer-checked:bg-primary shadow-inner",
      "after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all after:shadow-sm after:duration-300",
      "peer-checked:after:translate-x-5"
    )}></div>
  </label>
);

// --- Slider ---
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  labels?: string[];
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ value, min, max, step = 1, onChange, labels, className }) => {
  // Calculate percentage for gradient background
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full">
        {/* Fill Track */}
        <div 
          className="absolute h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Custom Thumb (Visual only) */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-6 w-6 bg-white rounded-full shadow-md border border-gray-100 pointer-events-none transition-all duration-150 ease-out"
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <div className="absolute inset-0 rounded-full bg-primary opacity-20 scale-150 animate-pulse-glow" />
        </div>
      </div>

      {labels && (
        <div className="flex justify-between mt-4 px-1">
          {labels.map((l, i) => (
            <span key={i} className={cn("text-xs font-medium transition-colors", i + min === value ? "text-primary" : "text-gray-400")}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// --- NumberStepper ---
interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({ value, min = 0, max = 100, onChange, label }) => {
  const handleChange = (newValue: number) => {
    if (newValue >= min && newValue <= max) onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <div className="flex items-baseline gap-2 relative">
        <span className="text-7xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent transition-all">
          {value}
        </span>
        {label && <span className="text-xl text-gray-400 font-medium">{label}</span>}
      </div>
      
      <div className="flex items-center justify-between w-full max-w-[240px] bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg">
        <button 
          onClick={() => handleChange(value - 1)}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-30 btn-press text-2xl"
          disabled={value <= min}
        >
          -
        </button>
        <button 
          onClick={() => handleChange(value + 1)}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-30 btn-press text-2xl"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};

// --- ListItem ---
interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({ title, subtitle, rightIcon, className, onClick, ...props }) => (
  <div 
    className={cn("flex items-center justify-between p-4 glass-card rounded-2xl active:scale-[0.99] transition-all cursor-pointer group", className)}
    onClick={onClick}
    {...props}
  >
    <div className="flex-1">
      <h3 className="text-gray-900 dark:text-white font-semibold group-hover:text-primary transition-colors">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
    </div>
    <div className="text-gray-400 group-hover:text-primary transition-colors pl-4">
      {rightIcon || <ChevronRight size={20} />}
    </div>
  </div>
);

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 pl-1">{label}</label>}
    <input 
      className={cn(
        "w-full h-14 px-5 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-gray-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-medium",
        className
      )}
      {...props}
    />
  </div>
);

// --- BottomSheet ---
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else setTimeout(() => setIsVisible(false), 300);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div 
        className={cn(
          "relative w-full max-w-md bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl rounded-t-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[85vh] overflow-y-auto no-scrollbar border-t border-white/20",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300/50 dark:bg-zinc-700/50 rounded-full mb-6" />
        {title && (
          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-2 bg-gray-100/50 dark:bg-zinc-800/50 rounded-full hover:bg-gray-200/50 transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// --- Toast ---
interface ToastProps {
  isVisible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ isVisible, message, actionLabel, onAction, type = 'success' }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
      <div className="bg-white/10 backdrop-blur-xl dark:bg-zinc-800/60 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20 ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]", type === 'success' ? "bg-green-400 text-green-400" : "bg-red-400 text-red-400")} />
          <span className="font-semibold text-sm text-gray-900 dark:text-white tracking-wide">{message}</span>
        </div>
        {actionLabel && (
          <button 
            onClick={onAction}
            className="text-primary font-bold text-sm px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors ml-2"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
