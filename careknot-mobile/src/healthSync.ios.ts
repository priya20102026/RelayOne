// iOS version: reads last night's sleep from Apple Health (which includes
// sleep recorded by an Apple Watch). Read-only, on-device, and only after the
// person taps "Import" and allows access. Nothing is stored or sent anywhere —
// the numbers just pre-fill the Check-In, and the caregiver can still edit them.
//
// Needs a native build (`npx expo run:ios`); it does not work in Expo Go. In
// Expo Go the import below throws and we return "unsupported", so the app keeps
// working with manual entry.
import { TurboModuleRegistry } from "react-native";
import type { HealthResult } from "./healthTypes";

export const HEALTH_IMPORT_AVAILABLE = true;

const SLEEP_ID = "HKCategoryTypeIdentifierSleepAnalysis";

// Apple's sleep-analysis values: 0 in bed, 1 asleep (unspecified), 2 awake,
// 3 asleep core, 4 asleep deep, 5 asleep REM.
type Stage = "asleep" | "awake" | "inBed" | "unknown";

function toStage(value: unknown): Stage {
  if (typeof value === "number") {
    if (value === 0) return "inBed";
    if (value === 2) return "awake";
    if (value === 1 || value === 3 || value === 4 || value === 5) return "asleep";
    return "unknown";
  }
  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v.includes("awake")) return "awake";
    if (v.includes("asleep")) return "asleep";
    if (v.includes("inbed")) return "inBed";
  }
  return "unknown";
}

type Interval = [number, number];

/** Merges overlapping intervals (e.g. iPhone + Watch both logging the same
 * minutes) so time asleep is never double counted. */
function mergeIntervals(list: Interval[]): Interval[] {
  const sorted = [...list].sort((a, b) => a[0] - b[0]);
  const out: Interval[] = [];
  for (const [s, e] of sorted) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}

export async function readLastNightSleep(): Promise<HealthResult> {
  // The HealthKit library needs the native "NitroModules" module compiled into
  // the app. If it isn't there (Expo Go, or a build that didn't link it),
  // loading the library throws a fatal red-screen error — so check first and
  // fall back to manual entry instead.
  try {
    if (!TurboModuleRegistry.get("NitroModules")) return { status: "unsupported" };
  } catch {
    return { status: "unsupported" };
  }

  let HK: any;
  try {
    HK = await import("@kingstinct/react-native-healthkit");
  } catch {
    return { status: "unsupported" }; // e.g. Expo Go: native module isn't there
  }

  try {
    if (typeof HK.isHealthDataAvailable === "function") {
      const available = await HK.isHealthDataAvailable();
      if (!available) return { status: "unsupported" };
    }

    await HK.requestAuthorization({ toRead: [SLEEP_ID] });

    // Most recent samples first; we filter to "last night" ourselves below.
    const samples: any[] = await HK.queryCategorySamples(SLEEP_ID, { limit: 500, ascending: false });

    // "Last night" = anything that ended after 6 PM yesterday.
    const windowStart = new Date();
    windowStart.setHours(0, 0, 0, 0);
    windowStart.setHours(-6); // 6 PM the previous day
    const from = windowStart.getTime();
    const now = Date.now();

    const asleep: Interval[] = [];
    const awake: Interval[] = [];
    for (const s of samples ?? []) {
      const start = new Date(s.startDate).getTime();
      const end = new Date(s.endDate).getTime();
      if (!isFinite(start) || !isFinite(end) || end <= from || start > now || end <= start) continue;
      const stage = toStage(s.value);
      if (stage === "asleep") asleep.push([Math.max(start, from), end]);
      else if (stage === "awake") awake.push([Math.max(start, from), end]);
    }

    const sleepIntervals = mergeIntervals(asleep);
    if (sleepIntervals.length === 0) return { status: "nodata" };

    const totalMs = sleepIntervals.reduce((sum, [s, e]) => sum + (e - s), 0);
    const sleepHours = Math.round((totalMs / 3600000) * 10) / 10;

    // A wake-up counts only if it happened between falling asleep and the
    // final wake time (not the morning "awake" period after the night ends).
    const firstSleep = sleepIntervals[0][0];
    const lastSleep = sleepIntervals[sleepIntervals.length - 1][1];
    const awakenings = mergeIntervals(awake).filter(([s, e]) => s > firstSleep && e < lastSleep).length;

    return { status: "ok", sleepHours, awakenings };
  } catch (e: any) {
    return { status: "error", message: String(e?.message ?? e) };
  }
}
