/**
 * Time parsing and formatting utilities
 */

export interface ParsedTime {
  hours: number; // 0-23
  minutes: number; // 0-59
}

export function parseTimeString(val?: string | null): ParsedTime | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();

  // Match 12h format e.g. "02:30 PM" or "2:30pm"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12 && match12[1] && match12[2] && match12[3]) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (h === 12) h = period === "AM" ? 0 : 12;
    else if (period === "PM") h += 12;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  // Match 24h format e.g. "14:30" or "09:05"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24 && match24[1] && match24[2]) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
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
