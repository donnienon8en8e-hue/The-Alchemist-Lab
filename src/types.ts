export type TabType = 'crucible' | 'roster' | 'calculator' | 'grimoire' | 'coach_ai';

export type AthleteClass = 'Strider (Road Racing)' | 'Trail Nomad (Trail & Elevation)' | 'Tri-Alchemist (Multisport / Triathlon)' | 'Ultrarunner (Ultra Endurance)';
export type AthleteStatus = 'Fresh (Optimal HRV / High Load)' | 'Fatigued (Moderate HRV / Caution)' | 'Recovering (Low HRV / Restrict High Intensity)';

export interface Athlete {
  id: string;
  name: string;
  title: string;
  athleteClass?: AthleteClass;
  athleteStatus?: AthleteStatus;
  level: number;
  exp: number;
  maxExp: number;
  staminaHp: number; // HP %
  staminaMaxHp: number;
  manaMp: number; // MP / Power %
  vo2Max: number; // ml/kg/min
  vdot: number;
  acwr: number; // Acute Chronic Workload Ratio (e.g. 1.15)
  acute7dKm: number;
  chronic28dKm: number;
  avgCadence: number;
  maxHr: number;
  restingHr: number;
  primaryDistance: string;
  avatarIcon: string; // 'wind' | 'flame' | 'shield' | 'star'
  themeColor: string; // hex
  pbs: {
    distance: string;
    time: string;
    vdotEst: number;
  }[];
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'aerobic' | 'threshold' | 'speed' | 'recovery' | 'catalyst';
  tier: 1 | 2 | 3;
  iconName: string;
  unit: string;
  description: string;
  physiologicalEffect: string;
  baseStress: number;
  baseVo2Gain: number;
  baseRecoveryHours: number;
  color: string;
}

export interface SelectedIngredient {
  ingredient: Ingredient;
  quantity: number;
}

export interface BrewedWorkout {
  id: string;
  title: string;
  elixirRank: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Forbidden';
  athleteId: string;
  athleteName: string;
  craftedAt: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  targetPace: string;
  targetHrZone: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  stressTSS: number;
  predictedVo2MaxBoost: number; // %
  recoveryHoursNeeded: number;
  injuryRiskLevel: 'Safe' | 'Optimal' | 'Caution' | 'Hazardous';
  instructions: string[];
}

export interface PacingZone {
  zone: string;
  name: string;
  alchemicalAlias: string;
  hrRangePct: string;
  paceRange: string;
  purpose: string;
  color: string;
}

export type FeelingLevel = 'Very Light' | 'Light' | 'Moderate' | 'Hard' | 'Max Effort';

export interface LoggedWorkout {
  id: string;
  date: string;
  athleteId: string;
  athleteName: string;
  workoutTitle: string;
  distanceKm: number;
  timeMinutes: number;
  avgPace: string;
  avgHr: number;
  rpeMana: number; // 1 to 10
  feeling?: FeelingLevel;
  potionUsed?: string;
  notes: string;
}
