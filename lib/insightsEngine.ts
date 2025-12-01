
import { DayLog } from '../types';
import { parseDate, diffDays, formatDate, addDays } from './utils';

// --- Types ---

export interface CycleData {
  id: string;
  startDate: string;
  length: number;
  periodLength: number;
  variance: number;
  logs: DayLog[];
}

export interface HeatmapCell {
  symptomId: string;
  dayIndex: number; // 1-based cycle day
  intensity: number; // 0-3 average
}

export interface CorrelationPoint {
  x: number; // e.g. Sleep
  y: number; // e.g. Mood or Symptom Level
  phase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal';
}

// --- Helpers ---

// Detect cycles from linear logs
export const detectCycles = (
  logs: Record<string, DayLog>,
  profileLastPeriod: string
): CycleData[] => {
  const sortedDates = Object.keys(logs).sort();
  const periodStarts: string[] = [];
  
  // 1. Identify period start dates (days where active=true and prev day was active=false or no log)
  sortedDates.forEach((date) => {
    const log = logs[date];
    if (log.menstruation?.active) {
      const d = parseDate(date);
      const prevD = addDays(d, -1);
      const prevLog = logs[formatDate(prevD)];
      
      // Allow 1 day gap to be considered same period? For strictness: no gap.
      if (!prevLog?.menstruation?.active) {
        periodStarts.push(date);
      }
    }
  });

  // Ensure profile's last period is included if not found in logs (for new users)
  if (profileLastPeriod && !periodStarts.includes(profileLastPeriod)) {
    // Insert correctly sorted
    periodStarts.push(profileLastPeriod);
    periodStarts.sort();
  }

  // 2. Build Cycles
  const cycles: CycleData[] = [];
  
  for (let i = 0; i < periodStarts.length - 1; i++) {
    const start = periodStarts[i];
    const nextStart = periodStarts[i + 1];
    
    const length = diffDays(parseDate(start), parseDate(nextStart));
    
    // Filter anomalies (e.g. cycle < 15 days or > 60 days)
    if (length < 15 || length > 90) continue;

    // Collect logs for this cycle
    const cycleLogs: DayLog[] = [];
    const startDateObj = parseDate(start);
    let pLen = 0;

    for (let d = 0; d < length; d++) {
      const current = addDays(startDateObj, d);
      const log = logs[formatDate(current)];
      if (log) {
        cycleLogs.push(log);
        if (log.menstruation?.active && d < 10) pLen++; // Count initial period days
      }
    }

    cycles.push({
      id: start,
      startDate: start,
      length,
      periodLength: Math.max(pLen, 1),
      variance: 0, // calc later
      logs: cycleLogs
    });
  }

  return cycles;
};

// Calculate Heatmap Data
export const calculateHeatmap = (cycles: CycleData[], maxDays = 35): Record<string, number[]> => {
  // Map: SymptomID -> Array[DayIndex 0..maxDays] -> Sum of intensities
  const symptomTotals: Record<string, number[]> = {};
  const symptomCounts: Record<string, number[]> = {};

  cycles.forEach(cycle => {
    cycle.logs.forEach(log => {
      const date = parseDate(log.date);
      const start = parseDate(cycle.startDate);
      const dayIndex = diffDays(start, date); // 0-based
      
      if (dayIndex >= maxDays) return;

      Object.entries(log.symptoms || {}).forEach(([symptomId, intensity]) => {
        if (!symptomTotals[symptomId]) {
            symptomTotals[symptomId] = new Array(maxDays).fill(0);
            symptomCounts[symptomId] = new Array(maxDays).fill(0);
        }
        symptomTotals[symptomId][dayIndex] += intensity;
        symptomCounts[symptomId][dayIndex] += 1;
      });
    });
  });

  // Average
  const result: Record<string, number[]> = {};
  Object.keys(symptomTotals).forEach(sId => {
    result[sId] = symptomTotals[sId].map((total, idx) => {
        const count = symptomCounts[sId][idx];
        return count > 0 ? total / count : 0;
    });
  });

  return result;
};

// Pearson Correlation
export const calculateCorrelation = (cycles: CycleData[]): number | null => {
  let xSum = 0, ySum = 0, xySum = 0, xSqSum = 0, ySqSum = 0, n = 0;

  cycles.forEach(cycle => {
    cycle.logs.forEach(log => {
      // Correlation: Sleep (X) vs Mood/Symptom load (Y)
      // Mood mapping: good=1, normal=2, low=3, bad=4 (Inverse logic: more sleep = better mood(lower val)?)
      // Let's correlate Sleep vs Total Symptom Intensity
      
      if (log.sleep !== null && log.sleep > 0) {
        const x = log.sleep;
        // Sum all symptom intensities
        const y = Object.values(log.symptoms || {}).reduce((a, b) => a + b, 0);
        
        xSum += x;
        ySum += y;
        xySum += x * y;
        xSqSum += x * x;
        ySqSum += y * y;
        n++;
      }
    });
  });

  if (n < 5) return null; // Not enough data

  const numerator = (n * xySum) - (xSum * ySum);
  const denominator = Math.sqrt((n * xSqSum - xSum * xSum) * (n * ySqSum - ySum * ySum));

  return denominator === 0 ? 0 : numerator / denominator;
};
