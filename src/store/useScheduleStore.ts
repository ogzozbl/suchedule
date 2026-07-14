import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SelectedSection } from "@/lib/types";

interface Filters {
  freeDay: number | null; // 0-6 or null
  lunchStart: number | null; // period index or null
  lunchEnd: number | null; // exclusive period index or null
  excludedInstructors: number[]; // instructor indices to hide from search
}

interface ScheduleState {
  selected: SelectedSection[];
  filters: Filters;
  addSection: (section: SelectedSection) => void;
  removeSection: (crn: string) => void;
  removeCourse: (courseCode: string) => void;
  isSelected: (crn: string) => boolean;
  setSelected: (sections: SelectedSection[]) => void;
  setFreeDay: (day: number | null) => void;
  setLunchWindow: (start: number | null, end: number | null) => void;
  toggleExcludedInstructor: (instructorIndex: number) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      selected: [],
  filters: {
    freeDay: null,
    lunchStart: null,
    lunchEnd: null,
    excludedInstructors: [],
  },
  addSection: (section) =>
    set((state) => ({
      selected: state.selected.some((s) => s.section.crn === section.section.crn)
        ? state.selected
        : [...state.selected, section],
    })),
  removeSection: (crn) =>
    set((state) => ({
      selected: state.selected.filter((s) => s.section.crn !== crn),
    })),
  removeCourse: (courseCode) =>
    set((state) => ({
      selected: state.selected.filter((s) => s.courseCode !== courseCode),
    })),
  isSelected: (crn) => get().selected.some((s) => s.section.crn === crn),
  setSelected: (sections) => set({ selected: sections }),
  setFreeDay: (day) =>
    set((state) => ({ filters: { ...state.filters, freeDay: day } })),
  setLunchWindow: (start, end) =>
    set((state) => ({
      filters: { ...state.filters, lunchStart: start, lunchEnd: end },
    })),
  toggleExcludedInstructor: (instructorIndex) =>
    set((state) => {
      const exists = state.filters.excludedInstructors.includes(instructorIndex);
      return {
        filters: {
          ...state.filters,
          excludedInstructors: exists
            ? state.filters.excludedInstructors.filter((i) => i !== instructorIndex)
            : [...state.filters.excludedInstructors, instructorIndex],
        },
      };
    }),
    }),
    {
      name: "suchedule",
      partialize: (state) => ({
        selected: state.selected,
        filters: state.filters,
      }),
      // SSR renders empty state; rehydrate manually after mount to avoid
      // hydration mismatches (see ScheduleApp).
      skipHydration: true,
    }
  )
);
