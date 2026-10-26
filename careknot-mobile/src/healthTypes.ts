// Shared result type for the optional Apple Health import (see healthSync.ts
// and healthSync.ios.ts). Kept in its own file so both platform versions can
// import it without resolving to themselves.
export type HealthResult =
  | { status: "ok"; sleepHours: number; awakenings: number }
  | { status: "unsupported" } // web, Android, or Expo Go (no HealthKit)
  | { status: "nodata" } // nothing found for last night, or access wasn't allowed
  | { status: "error"; message: string };
