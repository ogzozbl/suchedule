"use client";

import { useEffect, useRef, useState } from "react";
import { useScheduleStore } from "@/store/useScheduleStore";
import { buildShareUrl } from "@/lib/share";
import { downloadIcs } from "@/lib/ics";
import { downloadPng } from "@/lib/png";
import ThemeToggle from "./ThemeToggle";
import type { CourseData } from "@/lib/types";

type CopyState = "idle" | "done" | "error";

export default function Header({ data }: { data: CourseData }) {
  const selected = useScheduleStore((s) => s.selected);
  const [crnState, setCrnState] = useState<CopyState>("idle");
  const [shareState, setShareState] = useState<CopyState>("idle");
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function copy(text: string, set: (s: CopyState) => void) {
    try {
      await navigator.clipboard.writeText(text);
      set("done");
    } catch {
      set("error");
    }
    setTimeout(() => set("idle"), 1500);
  }

  const disabled = selected.length === 0;

  return (
    <header className="sticky top-0 z-20 h-14 bg-surface border-b border-line">
      <div className="max-w-[1440px] mx-auto h-full px-5 flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="text-base font-bold tracking-tight">SUchedule</span>
          <span className="hidden sm:inline text-[11.5px] text-muted border border-line rounded-full px-2.5 py-0.5">
            Fall 2026–27
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              copy(selected.map((s) => s.section.crn).join(", "), setCrnState)
            }
            disabled={disabled}
            className="h-8 px-3 rounded-lg border border-line bg-surface text-xs font-medium hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {crnState === "done"
              ? "Copied ✓"
              : crnState === "error"
              ? "Couldn't copy"
              : "Copy CRNs"}
          </button>

          <div ref={exportRef} className="relative">
            <button
              onClick={() => setExportOpen((o) => !o)}
              disabled={disabled}
              className="h-8 px-3 rounded-lg border border-line bg-surface text-xs font-medium hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export ▾
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-line bg-surface shadow-lg p-1 z-30">
                <button
                  onClick={() => {
                    downloadIcs(selected, data);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-md text-xs hover:bg-surface-2"
                >
                  Calendar file (.ics)
                  <span className="block text-[10px] text-muted">
                    Import into Google / Apple Calendar
                  </span>
                </button>
                <button
                  onClick={() => {
                    downloadPng(selected, data);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-md text-xs hover:bg-surface-2"
                >
                  Image (.png)
                  <span className="block text-[10px] text-muted">
                    Share your weekly schedule
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => copy(buildShareUrl(selected), setShareState)}
            disabled={disabled}
            className="h-8 px-3 rounded-lg bg-accent text-white dark:text-[#16182B] text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {shareState === "done"
              ? "Link copied ✓"
              : shareState === "error"
              ? "Couldn't copy"
              : "Share"}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
