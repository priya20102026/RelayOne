// Default (web / Android) version: Health import isn't available here, so the
// caregiver types their sleep into the Check-In instead. The real Apple Health
// version lives in healthSync.ios.ts — Metro picks it automatically on iOS, which
// also keeps the HealthKit library out of the web and Android bundles.
import type { HealthResult } from "./healthTypes";

export const HEALTH_IMPORT_AVAILABLE = false;

export async function readLastNightSleep(): Promise<HealthResult> {
  return { status: "unsupported" };
}
