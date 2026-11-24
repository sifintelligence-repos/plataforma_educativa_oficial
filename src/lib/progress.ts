import {
  COURSES,
  LESSONS,
  MATERIALS,
  courseById,
  lessonsFor,
  type MaterialState,
} from "@/lib/catalog";

export function courseProgress(courseId: string, done: Set<string>) {
  const lessons = lessonsFor(courseId);
  const n = lessons.filter((l) => done.has(l.id)).length;
  const total = lessons.length;
  const pct = total === 0 ? 0 : Math.round((100 * n) / total);
  return { n, total, pct };
}

export function overallProgress(done: Set<string>) {
  const total = LESSONS.length;
  const n = LESSONS.filter((lesson) => done.has(lesson.id)).length;
  return { n, total, pct: total === 0 ? 0 : Math.round((100 * n) / total) };
}

export function startedProgress(done: Set<string>) {
  const startedIds = new Set(
    COURSES.filter((course) => lessonsFor(course.id).some((lesson) => done.has(lesson.id))).map((course) => course.id),
  );
  const lessons = LESSONS.filter((lesson) => startedIds.has(lesson.courseId));
  if (lessons.length === 0) return overallProgress(done);
  const n = lessons.filter((lesson) => done.has(lesson.id)).length;
  return { n, total: lessons.length, pct: Math.round((100 * n) / lessons.length) };
}

export function continueStudy(done: Set<string>, focusId?: string | null) {
  const preferred = [focusId, "python", "informes", "react", "osint", "web", "ventas", "marketing", "kernel"].filter(
    (id): id is string => Boolean(id),
  );
  const order = [...preferred, ...COURSES.map((course) => course.id).filter((id) => !preferred.includes(id))];
  for (const id of order) {
    const progress = courseProgress(id, done);
    if (progress.n < progress.total) {
      const lesson = LESSONS.find((l) => l.courseId === id && !done.has(l.id)) ?? null;
      const course = courseById(id);
      if (!course || !lesson) continue;
      return { course, progress, lesson };
    }
  }
  return null;
}

export function doneSet(lessons: { lessonId: string; done: boolean }[]) {
  return new Set(lessons.filter((l) => l.done).map((l) => l.lessonId));
}

export function materialMap(rows: { materialId: string; state: MaterialState }[]) {
  const map = new Map<string, MaterialState>();
  for (const row of rows) map.set(row.materialId, row.state);
  for (const material of MATERIALS) {
    if (!map.has(material.id)) map.set(material.id, material.defaultState);
  }
  return map;
}

export function readPayload<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<T>;
    if (!parsed || typeof parsed !== "object") return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function firstName(name: string | null | undefined) {
  const clean = (name ?? "").trim();
  if (!clean) return "estudiante";
  return clean.split(/\s+/)[0] ?? "estudiante";
}

export function courseTitle(courseId: string) {
  return COURSES.find((c) => c.id === courseId)?.title ?? "Estudio";
}
