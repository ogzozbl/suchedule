import ScheduleApp from "@/components/ScheduleApp";
import courseData from "@/data/courses.json";
import type { CourseData } from "@/lib/types";

export default function Home() {
  return <ScheduleApp data={courseData as CourseData} />;
}
