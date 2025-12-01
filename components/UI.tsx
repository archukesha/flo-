import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { ChevronRight, X } from 'lucide-react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, variant = 'primary', size = 'md', fullWidth, children, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 transform duration-200";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)} 
      {...props}
    >
      {children}
    </button>
  );
};

// Card
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 transition-shadow hover:shadow-md", className)} {...props}>
    {children}
  </div>
);

// Chip
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
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border active:scale-95",
        active 
          ? color === 'primary' ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
          : "bg-surface text-gray-600 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700",
        className
      )}
    >
      {label}
    </button>
  );
};

// Toggle
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, className }) => (
  <label className={cn("relative inline-flex items-center cursor-pointer touch-manipulation", className)}>
    <input 
      type="checkbox" 
      className="sr-only peer" 
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 peer-checked:bg-primary shadow-inner"></div>
  </label>
);

// Slider
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
  return (
    <div className={cn("w-full py-2", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      {labels && (
        <div className="flex justify-between mt-2 px-1">
          {labels.map((l, i) => (
            <span key={i} className={cn("text-xs transition-colors duration-200", i + min === value ? "text-primary font-bold scale-110" : "text-gray-400")}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// NumberStepper
interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({ value, min = 0, max = 100, onChange, label }) => {
  const handleChange = (newValue: number) => {
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-baseline gap-2 animate-scale-in">
        <span className="text-6xl font-bold text-gray-900 dark:text-white tracking-tighter">{value}</span>
        {label && <span className="text-2xl text-gray-400 font-normal">{label}</span>}
      </div>
      
      <div className="flex items-center justify-between w-full max-w-[220px] bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <button 
          onClick={() => handleChange(value - 1)}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50 active:scale-95 transition-all text-2xl font-medium"
          disabled={value <= min}
        >
          -
        </button>
        <button 
          onClick={() => handleChange(value + 1)}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all text-2xl font-medium"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};

// List Item
interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({ title, subtitle, rightIcon, className, onClick, ...props }) => (
  <div 
    className={cn("flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl active:bg-gray-50 dark:active:bg-zinc-800 transition-colors cursor-pointer", className)}
    onClick={onClick}
    {...props}
  >
    <div>
      <h3 className="text-gray-900 dark:text-white font-medium">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className="text-gray-400">
      {rightIcon || <ChevronRight size={20} />}
    </div>
  </div>
);

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
    <input 
      className={cn("w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all", className)}
      {...props}
    />
  </div>
);

// BottomSheet
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          "relative w-full max-w-md bg-surface dark:bg-zinc-900 rounded-t-[32px] p-6 shadow-2xl transform transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1) max-h-[85vh] overflow-y-auto no-scrollbar pointer-events-auto",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mb-6" />
        
        {title && (
          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full active:scale-90 transition-transform">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

// Toast
interface ToastProps {
  isVisible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ isVisible, message, actionLabel, onAction, type = 'success' }) => {
  if (!isVisible) return null;
  
  // Positioned at TOP to avoid Telegram MainButton overlap
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-up pointer-events-auto">
      <div className={cn(
        "backdrop-blur-md text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-white/10",
        type === 'success' ? "bg-gray-900/90 dark:bg-zinc-800/90" : 
        type === 'error' ? "bg-red-500/90" : "bg-blue-500/90"
      )}>
        <div className="flex items-center gap-3">
          {type === 'success' && <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>}
          <span className="font-medium text-sm">{message}</span>
        </div>
        {actionLabel && (
          <button 
            onClick={onAction}
            className="text-primary font-bold text-sm px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors ml-2"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};