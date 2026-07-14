import type { Course, SelectedSection } from "./types";

export function encodeCrns(selected: SelectedSection[]): string {
  return selected.map((s) => s.section.crn).join(",");
}

export function decodeCrns(
  crnParam: string,
  courses: Course[]
): SelectedSection[] {
  const crns = new Set(crnParam.split(",").filter(Boolean));
  const result: SelectedSection[] = [];

  for (const course of courses) {
    for (const cls of course.classes) {
      for (const section of cls.sections) {
        if (crns.has(section.crn)) {
          result.push({
            courseCode: course.code,
            courseName: course.name,
            classType: cls.type,
            section,
          });
        }
      }
    }
  }

  return result;
}

export function buildShareUrl(selected: SelectedSection[]): string {
  const crnParam = encodeCrns(selected);
  const url = new URL(window.location.href);
  url.searchParams.set("crns", crnParam);
  return url.toString();
}
