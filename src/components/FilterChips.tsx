"use client";

import { useEffect, useRef, useState } from "react";
import { useScheduleStore } from "@/store/useScheduleStore";
import { DAY_NAMES, PERIOD_TIMES } from "@/lib/schedule";
import type { CourseData } from "@/lib/types";

type Menu = "freeday" | "lunch" | "instructor" | null;

export default function FilterChips({ data }: { data: CourseData }) {
  const filters = useScheduleStore((s) => s.filters);
  const setFreeDay = useScheduleStore((s) => s.setFreeDay);
  const setLunchWindow = useScheduleStore((s) => s.setLunchWindow);
  const toggleExcludedInstructor = useScheduleStore(
    (s) => s.toggleExcludedInstructor
  );

  const [menu, setMenu] = useState<Menu>(null);
  const [instructorQuery, setInstructorQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const chipBase =
    "h-7 inline-flex items-center gap-1.5 px-2.5 rounded-full text-[11.5px] transition-colors cursor-pointer select-none";
  const chipOff = `${chipBase} border border-line text-muted hover:text-ink hover:border-muted`;
  const chipOn = `${chipBase} bg-accent-soft text-accent font-semibold`;

  const matchedInstructors = data.instructors
    .map((name, index) => ({ name, index }))
    .filter(({ name }) =>
      name.toLowerCase().includes(instructorQuery.trim().toLowerCase())
    )
    .slice(0, 20);

  return (
    <div ref={rootRef} className="relative">
      <div className="flex flex-wrap gap-1.5" data-filter-chips>
        {filters.freeDay !== null ? (
          <button
            className={chipOn}
            title="Change free day"
            onClick={() => setMenu(menu === "freeday" ? null : "freeday")}
          >
            Free day: {DAY_NAMES[filters.freeDay]}
            <span
              aria-label="Remove free day filter"
              role="button"
              className="hover:opacity-60"
              onClick={(e) => {
                e.stopPropagation();
                setFreeDay(null);
                setMenu(null);
              }}
            >
              ✕
            </span>
          </button>
        ) : (
          <button
            className={chipOff}
            onClick={() => setMenu(menu === "freeday" ? null : "freeday")}
          >
            + Free day
          </button>
        )}

        {filters.lunchStart !== null && filters.lunchEnd !== null ? (
          <button
            className={chipOn}
            title="Change lunch hours"
            onClick={() => setMenu(menu === "lunch" ? null : "lunch")}
          >
            Lunch {PERIOD_TIMES[filters.lunchStart].start}–
            {PERIOD_TIMES[filters.lunchEnd - 1].end}
            <span
              aria-label="Remove lunch filter"
              role="button"
              className="hover:opacity-60"
              onClick={(e) => {
                e.stopPropagation();
                setLunchWindow(null, null);
                setMenu(null);
              }}
            >
              ✕
            </span>
          </button>
        ) : (
          <button
            className={chipOff}
            onClick={() => {
              setLunchWindow(4, 5);
              setMenu("lunch");
            }}
          >
            + Lunch break
          </button>
        )}

        {filters.excludedInstructors.length > 0 ? (
          <button
            className={chipOn}
            onClick={() => setMenu(menu === "instructor" ? null : "instructor")}
          >
            Instructors: {filters.excludedInstructors.length}
          </button>
        ) : (
          <button
            className={chipOff}
            onClick={() => setMenu(menu === "instructor" ? null : "instructor")}
          >
            + Instructor
          </button>
        )}
      </div>

      {menu === "freeday" && (
        <div className="absolute z-10 mt-1.5 rounded-lg border border-line bg-surface shadow-lg p-1.5 flex gap-1">
          {DAY_NAMES.slice(0, 5).map((d, i) => (
            <button
              key={d}
              onClick={() => {
                setFreeDay(i);
                setMenu(null);
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-accent-soft hover:text-accent"
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {menu === "lunch" && filters.lunchStart !== null && (
        <div className="absolute z-10 mt-1.5 rounded-lg border border-line bg-surface shadow-lg p-2.5 flex items-center gap-2 text-xs">
          <select
            value={filters.lunchStart}
            onChange={(e) =>
              setLunchWindow(Number(e.target.value), filters.lunchEnd)
            }
            className="rounded-md border border-line bg-surface-2 px-2 py-1"
          >
            {PERIOD_TIMES.map((p, i) => (
              <option key={i} value={i}>
                {p.start}
              </option>
            ))}
          </select>
          <span className="text-muted">–</span>
          <select
            value={filters.lunchEnd ?? 5}
            onChange={(e) =>
              setLunchWindow(filters.lunchStart, Number(e.target.value))
            }
            className="rounded-md border border-line bg-surface-2 px-2 py-1"
          >
            {PERIOD_TIMES.map((p, i) => (
              <option key={i} value={i + 1}>
                {p.end}
              </option>
            ))}
          </select>
          <button
            onClick={() => setMenu(null)}
            className="ml-1 px-2.5 py-1 rounded-md bg-accent-soft text-accent font-semibold"
          >
            Done
          </button>
        </div>
      )}

      {menu === "instructor" && (
        <div className="absolute z-10 mt-1.5 w-64 rounded-lg border border-line bg-surface shadow-lg p-2.5 space-y-2">
          <input
            value={instructorQuery}
            onChange={(e) => setInstructorQuery(e.target.value)}
            placeholder="Search instructors…"
            className="w-full h-8 rounded-md border border-line bg-surface-2 px-2.5 text-xs outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="max-h-44 overflow-y-auto space-y-0.5">
            {matchedInstructors.map(({ name, index }) => (
              <label
                key={index}
                className="flex items-center gap-2 text-xs px-1 py-1 rounded hover:bg-surface-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.excludedInstructors.includes(index)}
                  onChange={() => toggleExcludedInstructor(index)}
                />
                <span className="truncate">{name}</span>
              </label>
            ))}
            {instructorQuery && matchedInstructors.length === 0 && (
              <div className="text-xs text-muted px-1 py-1">No matches.</div>
            )}
          </div>
          <p className="text-[10.5px] text-muted">
            Checked instructors are hidden from results.
          </p>
        </div>
      )}
    </div>
  );
}
