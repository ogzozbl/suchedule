"use client";

import { useMemo, useState } from "react";
import { useScheduleStore } from "@/store/useScheduleStore";
import {
  DAY_NAMES,
  conflictLabel,
  firstConflict,
  sectionOccupiesDay,
  sectionOverlapsPeriodRange,
} from "@/lib/schedule";
import FilterChips from "./FilterChips";
import type { Course, CourseData, SelectedSection } from "@/lib/types";

const CLASS_TYPE_NAMES: Record<string, string> = {
  L: "Lab",
  R: "Recitation",
  D: "Discussion",
  N: "N",
  S: "S",
  E: "E",
};

function subjectOf(code: string): string {
  return code.split(" ")[0];
}

export default function CoursePanel({ data }: { data: CourseData }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const selected = useScheduleStore((s) => s.selected);
  const filters = useScheduleStore((s) => s.filters);
  const addSection = useScheduleStore((s) => s.addSection);
  const removeSection = useScheduleStore((s) => s.removeSection);
  const isSelected = useScheduleStore((s) => s.isSelected);

  const searching = query.trim().length >= 2;

  const results = useMemo(() => {
    if (!searching) return [];
    const q = query.trim().toLowerCase();
    return data.courses
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [query, searching, data.courses]);

  const browseGroups = useMemo(() => {
    const sorted = [...data.courses].sort((a, b) =>
      a.code.localeCompare(b.code, "en")
    );
    const groups: { subject: string; courses: Course[] }[] = [];
    for (const course of sorted) {
      const subject = subjectOf(course.code);
      const last = groups[groups.length - 1];
      if (last && last.subject === subject) {
        last.courses.push(course);
      } else {
        groups.push({ subject, courses: [course] });
      }
    }
    return groups;
  }, [data.courses]);

  const selectedCodes = useMemo(
    () => new Set(selected.map((s) => s.courseCode)),
    [selected]
  );

  function violations(schedule: SelectedSection["section"]["schedule"]) {
    const v: string[] = [];
    if (
      filters.freeDay !== null &&
      sectionOccupiesDay(schedule, filters.freeDay)
    ) {
      v.push(DAY_NAMES[filters.freeDay]);
    }
    if (
      filters.lunchStart !== null &&
      filters.lunchEnd !== null &&
      sectionOverlapsPeriodRange(schedule, filters.lunchStart, filters.lunchEnd)
    ) {
      v.push("Lunch");
    }
    return v;
  }

  function shakeChips() {
    const el = document.querySelector("[data-filter-chips]");
    if (!el) return;
    el.classList.remove("shake");
    void (el as HTMLElement).offsetWidth;
    el.classList.add("shake");
  }

  function renderSections(course: Course) {
    return (
      <div className="mt-1.5 space-y-1.5">
        {course.classes.map((cls) =>
          cls.sections.map((section) => {
            if (filters.excludedInstructors.includes(section.instructors)) {
              return null;
            }

            const candidate: SelectedSection = {
              courseCode: course.code,
              courseName: course.name,
              classType: cls.type,
              section,
            };
            const v = violations(section.schedule);
            const conflict = firstConflict(candidate, selected);
            const already = isSelected(section.crn);
            const typeName = CLASS_TYPE_NAMES[cls.type];

            return (
              <div
                key={section.crn}
                className={`rounded-[7px] bg-surface-2 px-2 py-1.5 text-xs transition-opacity ${
                  v.length > 0 && !already ? "opacity-45" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate">
                    <span className="font-mono text-[11.5px] text-muted">
                      {section.crn}
                    </span>{" "}
                    {typeName && <span className="text-muted">{typeName}</span>}{" "}
                    {section.group !== "0" && (
                      <span className="text-muted">{section.group}</span>
                    )}{" "}
                    <span>{data.instructors[section.instructors]}</span>
                    {v.map((label) => (
                      <span
                        key={label}
                        className="ml-1.5 rounded bg-danger-soft text-danger px-1 py-px text-[10px] font-medium"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (already) {
                        removeSection(section.crn);
                        return;
                      }
                      if (v.length > 0) shakeChips();
                      addSection(candidate);
                    }}
                    title={already ? "Remove from schedule" : undefined}
                    className={`group shrink-0 rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                      already
                        ? "bg-success-soft text-success hover:bg-danger-soft hover:text-danger"
                        : conflict
                        ? "bg-danger-soft text-danger hover:opacity-80"
                        : "bg-accent-soft text-accent hover:opacity-80"
                    }`}
                  >
                    {already ? (
                      <>
                        <span className="group-hover:hidden">Added ✓</span>
                        <span className="hidden group-hover:inline">Remove</span>
                      </>
                    ) : conflict ? (
                      "Add anyway"
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
                {conflict && !already && (
                  <div className="mt-1 text-[11px] text-danger">
                    ⚠ Conflicts with {conflictLabel(conflict)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses by code or name…"
          className="w-full h-10 rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-[12.5px] outline-none focus:ring-2 focus:ring-accent placeholder:text-muted"
        />
      </div>

      <FilterChips data={data} />

      <div className="flex-1 overflow-y-auto pr-0.5 min-h-0">
        {/* search results */}
        {searching && (
          <div className="space-y-2">
            {results.length === 0 && (
              <p className="text-[12.5px] text-muted text-center pt-10">
                No courses match &ldquo;{query.trim()}&rdquo;.
              </p>
            )}
            {results.map((course) => (
              <div
                key={course.code}
                className="rounded-[10px] border border-line bg-surface p-3"
              >
                <div className="text-[13px] font-semibold">
                  {course.code}{" "}
                  <span className="font-normal text-muted">
                    · {course.name}
                  </span>
                </div>
                {renderSections(course)}
              </div>
            ))}
          </div>
        )}

        {/* browse list: all courses A–Z, grouped by subject */}
        {!searching &&
          browseGroups.map((group) => (
            <div key={group.subject}>
              <div className="sticky top-0 z-[1] bg-surface py-1 text-[11px] font-semibold tracking-wider text-muted border-b border-line">
                {group.subject}
              </div>
              <div className="py-1">
                {group.courses.map((course) => {
                  const open = expanded === course.code;
                  const has = selectedCodes.has(course.code);
                  return (
                    <div key={course.code}>
                      <button
                        onClick={() => setExpanded(open ? null : course.code)}
                        className={`w-full flex items-center gap-2 px-1.5 py-1.5 rounded-md text-left text-[12.5px] hover:bg-surface-2 transition-colors ${
                          open ? "bg-surface-2" : ""
                        }`}
                      >
                        <span
                          className={`shrink-0 font-semibold ${
                            has ? "text-accent" : ""
                          }`}
                        >
                          {course.code}
                        </span>
                        <span className="truncate text-muted flex-1">
                          {course.name}
                        </span>
                        {has && (
                          <span className="shrink-0 text-success text-[10px]">
                            ●
                          </span>
                        )}
                        <svg
                          className={`shrink-0 text-muted transition-transform ${
                            open ? "rotate-90" : ""
                          }`}
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                      {open && (
                        <div className="px-1.5 pb-2">{renderSections(course)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
