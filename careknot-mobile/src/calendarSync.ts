// Thin wrapper around expo-calendar for syncing appointments to the
// phone's native calendar (iOS Calendar / Android Calendar). Plain,
// deterministic logic — no AI involved. Calendar access isn't available on
// web, so every function here is a safe no-op there.
import { Platform } from "react-native";

export type DeviceCalendarResult = "added" | "unsupported" | "denied" | "error";

/** Turns a dateLabel ("Today" / "Tomorrow" / anything else) plus a
 * "h:mm AM/PM" time string into a real Date. Falls back to today's date
 * when the label isn't recognized, since this app's mock data only ever
 * uses relative labels. */
function resolveDateTime(dateLabel: string, timeLabel: string): Date {
  const base = new Date();
  const label = dateLabel.trim().toLowerCase();
  if (label === "tomorrow") {
    base.setDate(base.getDate() + 1);
  }
  // "today" or anything unrecognized stays on today's date.

  const match = timeLabel.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    base.setHours(hours, minutes, 0, 0);
  }
  return base;
}

/** Requests calendar permission (if needed) and adds a single event to the
 * device's default writable calendar. Returns a result tag the caller can
 * show a message for, rather than throwing. */
export async function addAppointmentToDeviceCalendar(appointment: {
  title: string;
  dateLabel: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}): Promise<DeviceCalendarResult> {
  if (Platform.OS === "web") {
    // expo-calendar has no web implementation — the app still works, it
    // just can't reach a native calendar from a browser tab.
    return "unsupported";
  }

  try {
    // Imported lazily so the web bundle never tries to resolve a native-only
    // module at all.
    const Calendar = await import("expo-calendar/legacy");

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") return "denied";

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const target =
      calendars.find((c) => c.allowsModifications && c.isPrimary) ??
      calendars.find((c) => c.allowsModifications) ??
      calendars[0];
    if (!target) return "error";

    const startDate = resolveDateTime(appointment.dateLabel, appointment.startTime ?? "9:00 AM");
    const endDate = appointment.endTime
      ? resolveDateTime(appointment.dateLabel, appointment.endTime)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    await Calendar.createEventAsync(target.id, {
      title: appointment.title,
      startDate,
      endDate,
      notes: appointment.notes,
    });
    return "added";
  } catch {
    return "error";
  }
}
