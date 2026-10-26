import { LoadFactor, LoadSnapshot, LoadStatus, MomentOutcome } from "./types";

export interface CheckIn {
  sleepHours: number;
  nightAwakenings: number;
  stress: number; // 1-5
  energy: number; // 1-5
  careHoursToday: number;
}

export interface TaskContext {
  openTasks: number;
  overdueTasks: number;
  respiteHoursTakenThisWeek: number;
}

export interface LoadResult {
  score: number;
  status: LoadStatus;
  wellbeingBurden: number;
  taskVolume: number;
  supportRelief: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Deterministic, explainable caregiver-load calculation. No AI/ML —
 * just weighted arithmetic over the check-in + task context. */
export function calculateCaregiverLoad(checkIn: CheckIn, ctx: TaskContext): LoadResult {
  // Every sub-score is scaled 0–100 (0 = no strain, 100 = maximum strain), so
  // the final 0–100 score can genuinely reach "high" when inputs are severe.
  // (An earlier version left sub-scores on smaller scales, so the total could
  // never climb past ~36 no matter what was entered.)
  const sleep = clamp(checkIn.sleepHours, 0, 24);
  const sleepStrain = clamp(((7 - sleep) / 5) * 100, 0, 100); // 7h+ = 0, 2h or less = 100
  const awakeningStrain = clamp((checkIn.nightAwakenings / 4) * 100, 0, 100); // 4+ wake-ups = 100
  const stressStrain = clamp(((checkIn.stress - 1) / 4) * 100, 0, 100);
  const energyStrain = clamp(((5 - checkIn.energy) / 4) * 100, 0, 100);
  const wellbeingBurden = clamp(
    sleepStrain * 0.35 + awakeningStrain * 0.2 + stressStrain * 0.3 + energyStrain * 0.15,
    0,
    100
  );

  const careHoursStrain = clamp((checkIn.careHoursToday / 10) * 100, 0, 100); // 10h+ = 100
  const openTaskStrain = clamp((ctx.openTasks / 6) * 100, 0, 100); // 6+ open = 100
  const overdueStrain = clamp((ctx.overdueTasks / 2) * 100, 0, 100); // 2+ overdue = 100
  const taskVolume = clamp(careHoursStrain * 0.6 + openTaskStrain * 0.25 + overdueStrain * 0.15, 0, 100);

  const supportRelief = clamp((ctx.respiteHoursTakenThisWeek / 10) * 100, 0, 100); // 10h respite = 100

  const rawScore = wellbeingBurden * 0.5 + taskVolume * 0.5 - supportRelief * 0.15;
  const score = Math.round(clamp(rawScore, 0, 100));

  let status: LoadStatus = "steady";
  if (score >= 70) status = "high";
  else if (score >= 40) status = "elevated";

  return { score, status, wellbeingBurden: Math.round(wellbeingBurden), taskVolume: Math.round(taskVolume), supportRelief: Math.round(supportRelief) };
}

export function explainFactors(checkIn: CheckIn): LoadFactor[] {
  const factors: LoadFactor[] = [];

  if (checkIn.sleepHours < 6) {
    factors.push({ label: "Low sleep", detail: `${checkIn.sleepHours}h last night is below the 6–8h range.` });
  }
  if (checkIn.nightAwakenings > 1) {
    factors.push({ label: "Disrupted nights", detail: `Woke up ${checkIn.nightAwakenings} times overnight.` });
  }
  if (checkIn.stress >= 4) {
    factors.push({ label: "High stress", detail: `Self-rated stress at ${checkIn.stress}/5 today.` });
  }
  if (checkIn.energy <= 2) {
    factors.push({ label: "Low energy", detail: `Self-rated energy at ${checkIn.energy}/5 today.` });
  }
  if (checkIn.careHoursToday >= 6) {
    factors.push({ label: "Heavy care hours", detail: `${checkIn.careHoursToday}h of direct care today.` });
  }
  if (factors.length === 0) {
    factors.push({ label: "Steady day", detail: "No major strain signals from today's check-in." });
  }
  return factors;
}

const MOMENT_OUTCOME_DELTA: Record<MomentOutcome, number> = {
  resolved: -5,
  tough: 5,
  needed_backup: 12,
};

/** Folds the one-tap outcome from an "In This Moment" session into the
 * Wellbeing score — small, deterministic nudge, no AI involved. Never
 * required: the Home prompt that calls this is always optional/dismissable. */
export function applyMomentOutcome(snapshot: LoadSnapshot, outcome: MomentOutcome): LoadSnapshot {
  const delta = MOMENT_OUTCOME_DELTA[outcome];
  const wellbeingBurden = clamp(snapshot.wellbeingBurden + delta, 0, 100);
  const score = Math.round(clamp(snapshot.score + delta * 0.5, 0, 100));

  let status: LoadStatus = "steady";
  if (score >= 70) status = "high";
  else if (score >= 40) status = "elevated";

  return {
    ...snapshot,
    wellbeingBurden,
    score,
    status,
    lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}
