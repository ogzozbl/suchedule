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
      <div className="max-w-[1440px] mx-auto h-full px-3 sm:px-5 flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="text-base font-bold tracking-tight">SUchedule</span>
          <span className="hidden sm:inline text-[11.5px] text-muted border border-line rounded-full px-2.5 py-0.5">
            Fall 2026–27
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() =>
              copy(selected.map((s) => s.section.crn).join(", "), setCrnState)
            }
            disabled={disabled}
            title="Copy CRNs"
            className="h-8 px-2.5 sm:px-3 rounded-lg border border-line bg-surface text-xs font-medium hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">
              {crnState === "done"
                ? "Copied ✓"
                : crnState === "error"
                ? "Couldn't copy"
                : "Copy CRNs"}
            </span>
            <span className="sm:hidden" aria-hidden>
              {crnState === "done" ? (
                "✓"
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-[-2px]">
                  <rect width="14" height="14" x="8" y="8" rx="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </span>
          </button>

          <div ref={exportRef} className="relative">
            <button
              onClick={() => setExportOpen((o) => !o)}
              disabled={disabled}
              title="Export"
              className="h-8 px-2.5 sm:px-3 rounded-lg border border-line bg-surface text-xs font-medium hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Export ▾</span>
              <span className="sm:hidden" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-[-2px]">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
              </span>
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
            title="Share link"
            className="h-8 px-2.5 sm:px-3 rounded-lg bg-accent text-white dark:text-[#16182B] text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <span className="hidden sm:inline">
              {shareState === "done"
                ? "Link copied ✓"
                : shareState === "error"
                ? "Couldn't copy"
                : "Share"}
            </span>
            <span className="sm:hidden" aria-hidden>
              {shareState === "done" ? (
                "✓"
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-[-2px]">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <path d="m16 6-4-4-4 4" />
                  <path d="M12 2v13" />
                </svg>
              )}
            </span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
