"use client";

import { useMemo } from "react";
import { useScheduleStore } from "@/store/useScheduleStore";
import {
  DAY_LABELS,
  PERIOD_COUNT,
  PERIOD_TIMES,
  slotsOverlap,
} from "@/lib/schedule";
import { courseHue } from "@/lib/colors";
import type { CourseData, ScheduleSlot, SelectedSection } from "@/lib/types";

const ROW_H = 48; // px per period
const HEADER_H = 40;

interface Placed {
  sel: SelectedSection;
  slot: ScheduleSlot;
  col: number;
  cols: number;
  conflicted: boolean;
}

function layoutDay(items: { sel: SelectedSection; slot: ScheduleSlot }[]): Placed[] {
  // group into connected components of overlapping slots
  const groups: (typeof items)[] = [];
  for (const item of items) {
    const hits = groups.filter((g) =>
      g.some((o) => slotsOverlap(o.slot, item.slot))
    );
    if (hits.length === 0) {
      groups.push([item]);
    } else {
      const merged = hits.flat();
      merged.push(item);
      for (const h of hits) groups.splice(groups.indexOf(h), 1);
      groups.push(merged);
    }
  }

  const placed: Placed[] = [];
  for (const group of groups) {
    const sorted = [...group].sort((a, b) => a.slot.start - b.slot.start);
    const colEnds: number[] = [];
    const assignment = sorted.map((item) => {
      let col = colEnds.findIndex((end) => item.slot.start >= end);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(0);
      }
      colEnds[col] = item.slot.start + item.slot.duration;
      return { item, col };
    });
    for (const { item, col } of assignment) {
      placed.push({
        sel: item.sel,
        slot: item.slot,
        col,
        cols: colEnds.length,
        conflicted: group.length > 1 && colEnds.length > 1,
      });
    }
  }
  return placed;
}

export default function ScheduleGrid({ data }: { data: CourseData }) {
  const selected = useScheduleStore((s) => s.selected);
  const filters = useScheduleStore((s) => s.filters);
  const removeSection = useScheduleStore((s) => s.removeSection);

  const dayCount = selected.some((s) =>
    s.section.schedule.some((slot) => slot.day >= 5)
  )
    ? 7
    : 5;

  const days = useMemo(() => {
    return Array.from({ length: dayCount }, (_, day) => {
      const items = selected.flatMap((sel) =>
        sel.section.schedule
          .filter((slot) => slot.day === day)
          .map((slot) => ({ sel, slot }))
      );
      return layoutDay(items);
    });
  }, [selected, dayCount]);

  const bodyH = PERIOD_COUNT * ROW_H;

  return (
    <div className="rounded-[10px] border border-line bg-surface overflow-hidden relative">
      <div
        className="grid"
        style={{ gridTemplateColumns: `56px repeat(${dayCount}, 1fr)` }}
      >
        {/* day headers */}
        <div
          className="bg-surface-2 border-b border-line"
          style={{ height: HEADER_H }}
        />
        {DAY_LABELS.slice(0, dayCount).map((label, i) => {
          const free = filters.freeDay === i;
          return (
            <div
              key={label}
              className={`bg-surface-2 border-b border-line flex items-center justify-center text-[11px] font-semibold tracking-wider ${
                free ? "text-success" : "text-muted"
              }`}
              style={{ height: HEADER_H }}
            >
              {label}
              {free && <span className="ml-1 font-normal">· free</span>}
            </div>
          );
        })}

        {/* time column */}
        <div className="relative" style={{ height: bodyH }}>
          {PERIOD_TIMES.map((p, i) => (
            <div
              key={i}
              className="absolute w-full text-center font-mono text-[10px] text-muted border-t border-line pt-1"
              style={{ top: i * ROW_H }}
            >
              {p.start}
            </div>
          ))}
        </div>

        {/* day columns */}
        {days.map((placed, day) => (
          <div
            key={day}
            className="relative border-l border-line"
            style={{ height: bodyH }}
          >
            {/* hour lines + lunch tint */}
            {Array.from({ length: PERIOD_COUNT }).map((_, period) => {
              const inLunch =
                filters.lunchStart !== null &&
                filters.lunchEnd !== null &&
                period >= filters.lunchStart &&
                period < filters.lunchEnd;
              return (
                <div
                  key={period}
                  className="absolute w-full border-t border-line"
                  style={{
                    top: period * ROW_H,
                    height: ROW_H,
                    background: inLunch ? "var(--lunch)" : undefined,
                  }}
                />
              );
            })}

            {/* course blocks */}
            {placed.map(({ sel, slot, col, cols, conflicted }) => (
              <div
                key={`${sel.section.crn}-${slot.start}`}
                className="absolute p-[3px]"
                style={{
                  top: slot.start * ROW_H,
                  height: slot.duration * ROW_H,
                  left: `${(col / cols) * 100}%`,
                  width: `${100 / cols}%`,
                }}
              >
                <button
                  onClick={() => removeSection(sel.section.crn)}
                  title={`${sel.courseCode} ${sel.section.crn} — click to remove`}
                  className={`course-block h-full w-full text-left rounded-md px-1.5 py-1 overflow-hidden cursor-pointer hover:opacity-75 transition-opacity ${
                    conflicted ? "conflicted" : ""
                  }`}
                  style={{ "--ch": courseHue(sel.courseCode) } as React.CSSProperties}
                >
                  <div className="text-[10.5px] font-semibold leading-tight truncate">
                    {sel.courseCode}
                    {sel.classType ? ` ${sel.classType}` : ""}
                  </div>
                  <div className="text-[9.5px] opacity-75 truncate">
                    {data.places[slot.place] ?? ""}
                  </div>
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selected.length === 0 && (
        <div className="absolute inset-0 top-[40px] flex items-center justify-center pointer-events-none">
          <p className="text-[13px] text-muted">
            Your week is empty. Search for a course to get started.
          </p>
        </div>
      )}
    </div>
  );
}
