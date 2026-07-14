export interface ScheduleSlot {
  day: number; // 0=Mon ... 6=Sun
  place: number; // index into places[]
  start: number; // period index, 0-10
  duration: number; // number of consecutive periods
}

export interface Section {
  crn: string;
  schedule: ScheduleSlot[];
  group: string;
  instructors: number; // index into instructors[]
}

export interface ClassGroup {
  type: string; // "" lecture, "L" lab, "R" recitation, "D" discussion, "N", "S", "E"
  sections: Section[];
}

export interface Course {
  name: string;
  code: string;
  classes: ClassGroup[];
}

export interface CourseData {
  courses: Course[];
  instructors: string[];
  places: string[];
}

export interface SelectedSection {
  courseCode: string;
  courseName: string;
  classType: string;
  section: Section;
}
