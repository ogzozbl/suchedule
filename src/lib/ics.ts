import { PERIOD_TIMES } from "./schedule";
import type { CourseData, SelectedSection } from "./types";

const WEEKS = 14; // typical semester length

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function nextWeekday(from: Date, weekday: number): Date {
  // weekday: 0=Mon ... 6=Sun; JS getDay(): 0=Sun
  const jsTarget = (weekday + 1) % 7;
  const d = new Date(from);
  const diff = (jsTarget - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function fmtLocal(d: Date, time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
    h
  )}${pad(m)}00`;
}

export function buildIcs(selected: SelectedSection[], data: CourseData): string {
  const now = new Date();
  const stamp = fmtLocal(now, `${pad(now.getHours())}:${pad(now.getMinutes())}`);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SUchedule//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const sel of selected) {
    for (const [i, slot] of sel.section.schedule.entries()) {
      const first = nextWeekday(now, slot.day);
      const start = PERIOD_TIMES[slot.start];
      const end = PERIOD_TIMES[Math.min(slot.start + slot.duration - 1, PERIOD_TIMES.length - 1)];
      const place = data.places[slot.place] ?? "";
      const summary = `${sel.courseCode}${sel.classType ? ` ${sel.classType}` : ""}`;

      lines.push(
        "BEGIN:VEVENT",
        `UID:suchedule-${sel.section.crn}-${i}@suchedule`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${fmtLocal(first, start.start)}`,
        `DTEND:${fmtLocal(first, end.end)}`,
        `RRULE:FREQ=WEEKLY;COUNT=${WEEKS}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${sel.courseName} (CRN ${sel.section.crn})`,
        `LOCATION:${place}`,
        "END:VEVENT"
      );
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(selected: SelectedSection[], data: CourseData) {
  const blob = new Blob([buildIcs(selected, data)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "suchedule.ics";
  a.click();
  URL.revokeObjectURL(url);
}
