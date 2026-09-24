/**
 * Time parsing, formatting, and slot generation utilities
 */

export interface ParsedTime {
  hours: number; // 0-23
  minutes: number; // 0-59
}

export interface TimeSlot {
  hours: number;
  minutes: number;
  label: string;
}

/**
 * Smart time parser supporting both standard formats (14:30, 2:30 PM)
 * and productivity shorthand (3p, 3pm, 9a, 330p, 1430, now, 3, 3:30)
 */
export function parseTimeString(val?: string | null): ParsedTime | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return null;

  if (trimmed === "now") {
    const now = new Date();
    return { hours: now.getHours(), minutes: now.getMinutes() };
  }

  // 1. Shorthand with am/pm suffix, e.g. "3p", "3pm", "3:30p", "330pm", "9a", "1130am"
  const shorthandMatch = trimmed.match(/^(\d{1,4})\s*([ap])m?$/);
  if (shorthandMatch && shorthandMatch[1] && shorthandMatch[2]) {
    const numPart = shorthandMatch[1];
    const isPm = shorthandMatch[2] === "p";
    let h: number;
    let m: number;

    if (numPart.length <= 2) {
      h = parseInt(numPart, 10);
      m = 0;
    } else if (numPart.length === 3) {
      h = parseInt(numPart.slice(0, 1), 10);
      m = parseInt(numPart.slice(1), 10);
    } else {
      h = parseInt(numPart.slice(0, 2), 10);
      m = parseInt(numPart.slice(2), 10);
    }

    if (h === 12) h = isPm ? 12 : 0;
    else if (isPm && h < 12) h += 12;

    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // 2. Standard 12h format e.g. "02:30 PM" or "2:30pm"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (match12 && match12[1] && match12[2] && match12[3]) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const isPm = match12[3] === "pm";
    if (h === 12) h = isPm ? 12 : 0;
    else if (isPm && h < 12) h += 12;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // 3. Colon format without am/pm, e.g. "14:30" or "3:30" or "9:00"
  const matchColon = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (matchColon && matchColon[1] && matchColon[2]) {
    let h = parseInt(matchColon[1], 10);
    const m = parseInt(matchColon[2], 10);
    // If h is between 1 and 6, assume afternoon PM in business contexts
    if (h >= 1 && h <= 6) h += 12;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // 4. Compact 4-digit or 3-digit number e.g. "1430" (14:30), "0930", "330" (15:30)
  const matchDigits = trimmed.match(/^(\d{3,4})$/);
  if (matchDigits && matchDigits[1]) {
    const raw = matchDigits[1];
    let h =
      raw.length === 3
        ? parseInt(raw.slice(0, 1), 10)
        : parseInt(raw.slice(0, 2), 10);
    const m =
      raw.length === 3
        ? parseInt(raw.slice(1), 10)
        : parseInt(raw.slice(2), 10);
    if (h >= 1 && h <= 6) h += 12;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // 5. Bare single/double digit hour e.g. "3" -> 15:00, "9" -> 09:00, "11" -> 11:00
  const matchSingleHour = trimmed.match(/^(\d{1,2})$/);
  if (matchSingleHour && matchSingleHour[1]) {
    let h = parseInt(matchSingleHour[1], 10);
    if (h >= 1 && h <= 6) h += 12;
    if (h >= 0 && h <= 23) {
      return { hours: h, minutes: 0 };
    }
  }

  return null;
}

export function formatTimeDisplay(
  hours: number,
  minutes: number,
  format: "12h" | "24h" = "12h"
): string {
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (format === "24h") {
    return `${pad(hours)}:${pad(minutes)}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(h12)}:${pad(minutes)} ${period}`;
}

/**
 * Generate regular interval time slots for a full 24h cycle
 */
export function generateTimeSlots(
  stepMinutes: number = 30,
  format: "12h" | "24h" = "12h"
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const totalMinutes = 24 * 60;

  for (let min = 0; min < totalMinutes; min += stepMinutes) {
    const hours = Math.floor(min / 60);
    const minutes = min % 60;
    slots.push({
      hours,
      minutes,
      label: formatTimeDisplay(hours, minutes, format),
    });
  }

  return slots;
}
