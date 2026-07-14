"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import CoursePanel from "./CoursePanel";
import SelectedChips from "./SelectedChips";
import ScheduleGrid from "./ScheduleGrid";
import { useScheduleStore } from "@/store/useScheduleStore";
import { decodeCrns } from "@/lib/share";
import type { CourseData } from "@/lib/types";

export default function ScheduleApp({ data }: { data: CourseData }) {
  const setSelected = useScheduleStore((s) => s.setSelected);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    // restore persisted schedule, then let a share link override it
    useScheduleStore.persist.rehydrate();
    const params = new URLSearchParams(window.location.search);
    const crns = params.get("crns");
    if (crns) {
      setSelected(decodeCrns(crns, data.courses));
    }
  }, [data.courses, setSelected]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header data={data} />

      <div className="flex-1 max-w-[1440px] mx-auto w-full px-3 sm:px-5 py-3 sm:py-4 flex gap-4 min-h-0">
        {/* left panel — desktop */}
        <aside className="hidden lg:flex w-[340px] shrink-0 flex-col rounded-[10px] border border-line bg-surface p-4 h-[calc(100vh-6rem)] sticky top-[4.5rem]">
          <CoursePanel data={data} />
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0 flex flex-col gap-2.5">
          <SelectedChips />
          <ScheduleGrid data={data} />
        </main>
      </div>

      {/* mobile FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="lg:hidden fixed right-5 z-30 h-12 px-5 rounded-full bg-accent text-white dark:text-[#16182B] text-sm font-semibold shadow-lg"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        + Add course
      </button>

      {/* mobile bottom sheet */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-[85dvh] rounded-t-2xl bg-surface border-t border-line p-4 flex flex-col"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Add courses</span>
              <button
                onClick={() => setSheetOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-2 text-muted"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <CoursePanel data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
