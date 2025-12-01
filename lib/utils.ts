import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensure dates are treated as local midnight to avoid timezone issues with 'YYYY-MM-DD'
export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

export const formatDateRu = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  const day = d.getDate();
  const month = MONTHS_GENITIVE[d.getMonth()];
  return `${day} ${month}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

export const startOfWeek = (date: Date, startDay: number = 1): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < startDay ? 7 : 0) + day - startDay;
  result.setDate(result.getDate() - diff);
  return result;
};

export const endOfWeek = (date: Date, startDay: number = 1): Date => {
  const result = startOfWeek(date, startDay);
  result.setDate(result.getDate() + 6);
  return result;
};

export const diffDays = (d1: Date, d2: Date): number => {
  // Reset times to midnight for accurate day difference
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const diffTime = date2.getTime() - date1.getTime(); // Removed Math.abs to allow direction check if needed
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const getMonthDays = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Telegram WebApp Mock/Helper
export const tg = (window as any).Telegram?.WebApp;

export const haptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error') => {
  if (tg?.HapticFeedback) {
    if (style === 'success' || style === 'warning' || style === 'error') {
      tg.HapticFeedback.notificationOccurred(style);
    } else {
      // Cast to specific impact style to satisfy TS
      tg.HapticFeedback.impactOccurred(style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft');
    }
  }
};