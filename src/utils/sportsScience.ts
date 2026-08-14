// Sports Science Formulas for Running Coaches & Athletes

/**
 * Calculates VDOT score based on distance in meters and time in seconds
 * Uses Jack Daniels VDOT formula approximation
 */
export function calculateVDOT(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  
  const timeMinutes = timeSeconds / 60;
  const velocityMpm = distanceMeters / timeMinutes; // meters per minute
  
  // % VO2Max = 0.8 + 0.1894393 * e^(-0.012778 * timeMinutes) + 0.2989558 * e^(-0.1932605 * timeMinutes)
  const percentVO2Max = 
    0.8 + 
    0.1894393 * Math.exp(-0.012778 * timeMinutes) + 
    0.2989558 * Math.exp(-0.1932605 * timeMinutes);
  
  // VO2 = -4.60 + 0.182258 * velocity + 0.000104 * velocity^2
  const vo2Cost = -4.60 + 0.182258 * velocityMpm + 0.000104 * Math.pow(velocityMpm, 2);
  
  const vdot = vo2Cost / percentVO2Max;
  return Math.round(vdot * 10) / 10; // 1 decimal place
}

/**
 * Converts pace in seconds per km to format "MM:SS /km"
 */
export function formatPace(secPerKm: number): string {
  if (!secPerKm || isNaN(secPerKm) || secPerKm <= 0) return "--:-- /km";
  const mins = Math.floor(secPerKm / 60);
  const secs = Math.round(secPerKm % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
}

/**
 * Converts pace string "MM:SS" or "M:SS" to seconds per km
 */
export function parsePaceToSec(paceStr: string): number {
  const parts = paceStr.replace('/km', '').trim().split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10) || 0;
    const s = parseInt(parts[1], 10) || 0;
    return m * 60 + s;
  }
  return 0;
}

/**
 * Calculates Pacing Zones based on VDOT
 */
export function getPacingZonesFromVDOT(vdot: number) {
  if (!vdot || vdot < 20) vdot = 40; // Default baseline VDOT

  // Approximate velocity at VO2Max (vVO2max) in m/min
  // vdot = -4.60 + 0.182258 * v + 0.000104 * v^2 -> solve quadratic
  // Or empirical multipliers:
  // Easy: 62%-70% vVO2max
  // Marathon: 75%-84% vVO2max
  // Threshold: 88%-92% vVO2max
  // Interval: 95%-100% vVO2max
  // Repetition: 105%-112% vVO2max

  // Baseline pace for VDOT approx:
  // VDOT 30 ~ 7:00 /km Easy
  // VDOT 40 ~ 5:45 /km Easy, 4:30 /km Thresh
  // VDOT 50 ~ 4:45 /km Easy, 3:42 /km Thresh
  // VDOT 60 ~ 4:05 /km Easy, 3:12 /km Thresh
  // VDOT 70 ~ 3:35 /km Easy, 2:48 /km Thresh

  const threshMpm = 29.5 + vdot * 3.75; // approx meters per minute at threshold
  const threshSecPerKm = (1000 / threshMpm) * 60;

  const easySec = threshSecPerKm * 1.25;
  const easySlowSec = threshSecPerKm * 1.38;
  
  const marathonFastSec = threshSecPerKm * 1.08;
  const marathonSlowSec = threshSecPerKm * 1.15;
  
  const thresholdFastSec = threshSecPerKm * 0.98;
  const thresholdSlowSec = threshSecPerKm * 1.03;

  const intervalFastSec = threshSecPerKm * 0.89;
  const intervalSlowSec = threshSecPerKm * 0.93;

  const repFastSec = threshSecPerKm * 0.82;
  const repSlowSec = threshSecPerKm * 0.86;

  return [
    {
      zone: 'E-Pace',
      name: 'Easy / Aerobic Base',
      alchemicalAlias: '🌿 Mithril Aerobic Elixir',
      hrRangePct: '60% - 79% HRmax',
      paceRange: `${formatPace(easySlowSec)} - ${formatPace(easySec)}`,
      purpose: 'Cellular mitochondria growth & capillary density alchemy',
      color: '#38D9C4', // Teal
    },
    {
      zone: 'M-Pace',
      name: 'Marathon Rhythm',
      alchemicalAlias: '🔮 Endurance Essence',
      hrRangePct: '80% - 88% HRmax',
      paceRange: `${formatPace(marathonSlowSec)} - ${formatPace(marathonFastSec)}`,
      purpose: 'Glycogen conservation & race tempo muscle efficiency',
      color: '#7AC93E', // Green-gold
    },
    {
      zone: 'T-Pace',
      name: 'Lactate Threshold',
      alchemicalAlias: '🔥 Lactate Crucible',
      hrRangePct: '88% - 92% HRmax',
      paceRange: `${formatPace(thresholdSlowSec)} - ${formatPace(thresholdFastSec)}`,
      purpose: 'Raises acid clearance capacity & fatigue tolerance threshold',
      color: '#C9973E', // Amber
    },
    {
      zone: 'I-Pace',
      name: 'VO2 Max Interval',
      alchemicalAlias: '⚡ Phoenix Surge Tonic',
      hrRangePct: '93% - 98% HRmax',
      paceRange: `${formatPace(intervalSlowSec)} - ${formatPace(intervalFastSec)}`,
      purpose: 'Expands maximum oxygen consumption ceiling & stroke volume',
      color: '#E2654B', // Ember Red
    },
    {
      zone: 'R-Pace',
      name: 'Repetition / Speed',
      alchemicalAlias: '☄️ Dragon Velocity Catalyst',
      hrRangePct: '> 98% HRmax',
      paceRange: `${formatPace(repSlowSec)} - ${formatPace(repFastSec)}`,
      purpose: 'Anaerobic power, running economy & neuromuscular recruitment',
      color: '#E23E82', // Magenta/Violet
    },
  ];
}

/**
 * Calculates Acute:Chronic Workload Ratio (ACWR)
 * Acute = 7-day total load (km or TSS)
 * Chronic = 28-day average weekly load (km or TSS)
 */
export function calculateACWR(acute7d: number, chronic28d: number) {
  const weeklyChronicAvg = chronic28d / 4;
  if (weeklyChronicAvg <= 0) {
    return { ratio: 1.0, status: 'Optimal', color: '#38D9C4', description: 'Fresh baseline' };
  }
  const ratio = Math.round((acute7d / weeklyChronicAvg) * 100) / 100;

  if (ratio < 0.8) {
    return {
      ratio,
      status: 'Under-Transmuted (Under-training)',
      color: '#3A7DA8',
      description: 'Fitness decaying. Increase workload to maintain alchemical potency.',
    };
  } else if (ratio >= 0.8 && ratio <= 1.3) {
    return {
      ratio,
      status: 'Optimal Alchemy (Sweet Spot)',
      color: '#38D9C4',
      description: 'Low injury risk. Peak adaptation and fitness progression zone!',
    };
  } else if (ratio > 1.3 && ratio <= 1.5) {
    return {
      ratio,
      status: 'High Load (Caution Required)',
      color: '#C9973E',
      description: 'Elevated fatigue. Monitor stamina closely & schedule recovery potion.',
    };
  } else {
    return {
      ratio,
      status: 'Over-Transmutation Danger! (> 1.5)',
      color: '#E2654B',
      description: 'Hazardous spike! 2-4x higher risk of injury or overtraining burnout.',
    };
  }
}

/**
 * Riegel Race Prediction Formula: T2 = T1 * (D2 / D1)^1.06
 */
export function predictRaceTime(knownMeters: number, knownSeconds: number, targetMeters: number): number {
  if (knownMeters <= 0 || knownSeconds <= 0 || targetMeters <= 0) return 0;
  return Math.round(knownSeconds * Math.pow(targetMeters / knownMeters, 1.06));
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatTimeSeconds(totalSec: number): string {
  if (!totalSec || totalSec <= 0) return "00:00";
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.round(totalSec % 60);

  if (hours > 0) {
    return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export type FeelingLevel = 'Very Light' | 'Light' | 'Moderate' | 'Hard' | 'Max Effort';

export interface FeelingDescriptor {
  level: FeelingLevel;
  rpeRange: string;
  rpeMin: number;
  rpeMax: number;
  label: string;
  badgeBg: string;
  border: string;
  textColor: string;
  color: string;
  description: string;
  emoji: string;
}

export const FEELING_LEVELS: FeelingDescriptor[] = [
  {
    level: 'Very Light',
    rpeRange: '1-2',
    rpeMin: 1,
    rpeMax: 2,
    label: 'VERY LIGHT',
    badgeBg: 'bg-[#38D9C4]/15',
    border: 'border-[#38D9C4]',
    textColor: 'text-[#38D9C4]',
    color: '#38D9C4',
    description: 'Zone 1 Active Recovery • Effortless stroll / shakeout',
    emoji: '🍃',
  },
  {
    level: 'Light',
    rpeRange: '3-4',
    rpeMin: 3,
    rpeMax: 4,
    label: 'LIGHT',
    badgeBg: 'bg-[#4ADE80]/15',
    border: 'border-[#4ADE80]',
    textColor: 'text-[#4ADE80]',
    color: '#4ADE80',
    description: 'Zone 2 Aerobic Base • Conversational, steady cruise',
    emoji: '🌿',
  },
  {
    level: 'Moderate',
    rpeRange: '5-6',
    rpeMin: 5,
    rpeMax: 6,
    label: 'MODERATE',
    badgeBg: 'bg-[#EBBF68]/15',
    border: 'border-[#EBBF68]',
    textColor: 'text-[#EBBF68]',
    color: '#EBBF68',
    description: 'Zone 3 Tempo • Comfortably hard, rhythmic breathing',
    emoji: '⚡',
  },
  {
    level: 'Hard',
    rpeRange: '7-8',
    rpeMin: 7,
    rpeMax: 8,
    label: 'HARD',
    badgeBg: 'bg-[#E2654B]/15',
    border: 'border-[#E2654B]',
    textColor: 'text-[#E2654B]',
    color: '#E2654B',
    description: 'Zone 4 Lactate Threshold • Heavy breathing, high focus',
    emoji: '🔥',
  },
  {
    level: 'Max Effort',
    rpeRange: '9-10',
    rpeMin: 9,
    rpeMax: 10,
    label: 'MAX EFFORT',
    badgeBg: 'bg-[#E05688]/15',
    border: 'border-[#E05688]',
    textColor: 'text-[#E05688]',
    color: '#E05688',
    description: 'Zone 5 VO2 Max / Anaerobic • All-out sprint, absolute exhaustion',
    emoji: '💥',
  },
];

export function getFeelingFromRpe(rpe: number | string | undefined): FeelingDescriptor {
  const num = typeof rpe === 'number' ? rpe : parseInt(String(rpe), 10) || 7;
  if (num <= 2) return FEELING_LEVELS[0];
  if (num <= 4) return FEELING_LEVELS[1];
  if (num <= 6) return FEELING_LEVELS[2];
  if (num <= 8) return FEELING_LEVELS[3];
  return FEELING_LEVELS[4];
}

