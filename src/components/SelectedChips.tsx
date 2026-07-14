"use client";

import { useMemo } from "react";
import { useScheduleStore } from "@/store/useScheduleStore";
import { courseHue } from "@/lib/colors";

export default function SelectedChips() {
  const selected = useScheduleStore((s) => s.selected);
  const removeCourse = useScheduleStore((s) => s.removeCourse);

  const courses = useMemo(() => {
    const codes: string[] = [];
    for (const s of selected) {
      if (!codes.includes(s.courseCode)) codes.push(s.courseCode);
    }
    return codes;
  }, [selected]);

  if (selected.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {courses.map((code) => (
        <button
          key={code}
          onClick={() => removeCourse(code)}
          title={`Remove ${code}`}
          className="course-chip h-[26px] inline-flex items-center gap-1.5 px-2 rounded-md text-[11.5px] font-semibold hover:opacity-80 transition-opacity"
          style={{ "--ch": courseHue(code) } as React.CSSProperties}
        >
          {code} <span aria-hidden className="opacity-60">✕</span>
        </button>
      ))}
      <span className="ml-auto text-[11.5px] text-muted">
        {courses.length} {courses.length === 1 ? "course" : "courses"} ·{" "}
        {selected.length} {selected.length === 1 ? "section" : "sections"}
      </span>
    </div>
  );
}
