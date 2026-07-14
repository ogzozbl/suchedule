import type { ScheduleSlot, SelectedSection } from "./types";

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const PERIOD_COUNT = 11;

export const PERIOD_TIMES: { start: string; end: string }[] = [
  { start: "08:40", end: "09:30" },
  { start: "09:40", end: "10:30" },
  { start: "10:40", end: "11:30" },
  { start: "11:40", end: "12:30" },
  { start: "12:40", end: "13:30" },
  { start: "13:40", end: "14:30" },
  { start: "14:40", end: "15:30" },
  { start: "15:40", end: "16:30" },
  { start: "16:40", end: "17:30" },
  { start: "17:40", end: "18:30" },
  { start: "18:40", end: "19:30" },
];

export function slotsOverlap(a: ScheduleSlot, b: ScheduleSlot): boolean {
  if (a.day !== b.day) return false;
  const aEnd = a.start + a.duration;
  const bEnd = b.start + b.duration;
  return a.start < bEnd && b.start < aEnd;
}

export function findConflicts(
  candidate: SelectedSection,
  selected: SelectedSection[]
): SelectedSection[] {
  const conflicts: SelectedSection[] = [];
  for (const sel of selected) {
    if (sel.section.crn === candidate.section.crn) continue;
    const overlap = candidate.section.schedule.some((cs) =>
      sel.section.schedule.some((ss) => slotsOverlap(cs, ss))
    );
    if (overlap) conflicts.push(sel);
  }
  return conflicts;
}

export interface ConflictInfo {
  with: SelectedSection;
  slot: ScheduleSlot; // the existing selection's overlapping slot
}

export function firstConflict(
  candidate: SelectedSection,
  selected: SelectedSection[]
): ConflictInfo | null {
  for (const sel of selected) {
    if (sel.section.crn === candidate.section.crn) continue;
    for (const cs of candidate.section.schedule) {
      for (const ss of sel.section.schedule) {
        if (slotsOverlap(cs, ss)) return { with: sel, slot: ss };
      }
    }
  }
  return null;
}

export function conflictLabel(info: ConflictInfo): string {
  return `${info.with.courseCode} · ${DAY_NAMES[info.slot.day]} ${
    PERIOD_TIMES[info.slot.start].start
  }`;
}

export function sectionOccupiesDay(slots: ScheduleSlot[], day: number): boolean {
  return slots.some((s) => s.day === day);
}

export function sectionOverlapsPeriodRange(
  slots: ScheduleSlot[],
  periodStart: number,
  periodEnd: number
): boolean {
  return slots.some((s) => {
    const end = s.start + s.duration;
    return s.start < periodEnd && periodStart < end;
  });
}
