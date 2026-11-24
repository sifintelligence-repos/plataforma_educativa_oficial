import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { COURSES, LESSONS, courseById } from "@/lib/catalog";
import { getSql } from "@/lib/db";

export type ProfileLesson = { id: string; title: string; done: boolean };

export type ProfileSignal = {
  userId: string;
  name: string;
  gmail: string;
  courseId: string | null;
  courseTitle: string;
  done: number;
  total: number;
  pct: number;
  remaining: number;
  streak: number;
  checkedToday: boolean;
  score: number | null;
  comment: string;
  practice: number;
  potential: number;
  potentialLabel: string;
  lessons: ProfileLesson[];
  days: { day: string; present: boolean }[];
};

function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

function shiftDay(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function streakOf(days: Set<string>, today: string) {
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  if (!days.has(cursor)) return 0;
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}

function potentialOf(pct: number, score: number, streak: number) {
  const streakScore = Math.min(streak, 10) * 10;
  const value = Math.round(pct * 0.45 + score * 0.4 + streakScore * 0.15);
  const potentialLabel = value >= 80 ? "Alto" : value >= 55 ? "En marcha" : "Por construir";
  return { potential: value, potentialLabel };
}

async function roleOf(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string; teaches: string | null; study_id: string | null; gmail: string; name: string | null }>`
    select p.role, p.teaches, p.study_id, p.gmail, u.name
    from ingress_profiles p
    left join "user" u on u.id = p.user_id
    where p.user_id = ${userId}
  `;
  return rows[0] ?? null;
}

async function signalFor(
  userId: string,
  name: string,
  gmail: string,
  courseId: string | null,
  today: string,
): Promise<ProfileSignal> {
  const sql = await getSql();
  const lessons = courseId ? LESSONS.filter((lesson) => lesson.courseId === courseId) : [];
  const doneRows = await sql<{ lesson_id: string; done: boolean }>`
    select lesson_id, done from lesson_progress where user_id = ${userId}
  `;
  const doneSet = new Set(doneRows.filter((row) => row.done === true || String(row.done) === "t" || String(row.done) === "true").map((row) => row.lesson_id));
  const finished = lessons.filter((lesson) => doneSet.has(lesson.id)).length;
  const total = lessons.length;
  const pct = total === 0 ? 0 : Math.round((100 * finished) / total);
  const dayRows = await sql<{ day: string }>`
    select day::text as day from attendance_days where user_id = ${userId}
  `;
  const present = new Set(dayRows.map((row) => String(row.day).slice(0, 10)));
  const gradeRows = courseId
    ? await sql<{ score: number; comment: string }>`
        select score, comment from course_grades where user_id = ${userId} and course_id = ${courseId}
      `
    : [];
  const score = gradeRows[0] ? Number(gradeRows[0].score) : null;
  const practice = pct;
  const used = score ?? practice;
  const { potential, potentialLabel } = potentialOf(pct, used, streakOf(present, today));
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = shiftDay(today, index - 13);
    return { day, present: present.has(day) };
  });
  return {
    userId,
    name: name.trim() || gmail,
    gmail,
    courseId,
    courseTitle: courseById(courseId ?? "")?.title ?? "Sin programa",
    done: finished,
    total,
    pct,
    remaining: Math.max(0, total - finished),
    streak: streakOf(present, today),
    checkedToday: present.has(today),
    score,
    comment: gradeRows[0]?.comment ?? "",
    practice,
    potential,
    potentialLabel,
    lessons: lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, done: doneSet.has(lesson.id) })),
    days,
  };
}

export const getProfileBoard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ mine: ProfileSignal; roster: ProfileSignal[] }> => {
    const mine = await roleOf(context.userId);
    if (!mine) throw new Error("Completá el ingreso primero");
    const today = todayISO();
    const ownCourse = mine.role === "estudiante" ? mine.study_id : null;
    const self = await signalFor(context.userId, mine.name ?? "", mine.gmail, ownCourse, today);
    if (mine.role === "estudiante") return { mine: self, roster: [] };

    const sql = await getSql();
    const students = await sql<{ user_id: string; gmail: string; name: string | null; study_id: string | null }>`
      select p.user_id, p.gmail, u.name, p.study_id
      from ingress_profiles p
      left join "user" u on u.id = p.user_id
      where p.role = 'estudiante'
      order by u.name asc
    `;
    const roster: ProfileSignal[] = [];
    for (const student of students) {
      if (mine.role === "profesor" && student.study_id !== mine.teaches) continue;
      roster.push(await signalFor(student.user_id, student.name ?? "", student.gmail, student.study_id, today));
    }
    return { mine: self, roster };
  });

export const markAttendance = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const mine = await roleOf(context.userId);
    if (!mine) throw new Error("Completá el ingreso primero");
    const sql = await getSql();
    const today = todayISO();
    await sql`
      insert into attendance_days (user_id, day)
      values (${context.userId}, ${today}::date)
      on conflict (user_id, day) do nothing
    `;
    return { ok: true as const };
  });

export const setGrade = createServerFn({ method: "POST" })
  .validator((input: { userId?: string; score?: number; comment?: string }) => {
    const userId = String(input?.userId ?? "");
    const score = Math.round(Number(input?.score));
    const comment = String(input?.comment ?? "").trim().slice(0, 160);
    if (!userId || !Number.isFinite(score) || score < 0 || score > 100) throw new Error("Nota inválida");
    return { userId, score, comment };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await roleOf(context.userId);
    if (!mine || (mine.role !== "profesor" && mine.role !== "ceo")) throw new Error("Sin permiso");
    const sql = await getSql();
    const target = await sql<{ study_id: string | null; role: string }>`
      select study_id, role from ingress_profiles where user_id = ${data.userId}
    `;
    const student = target[0];
    if (!student || student.role !== "estudiante" || !student.study_id) throw new Error("No es un estudiante");
    if (mine.role === "profesor" && mine.teaches !== student.study_id) throw new Error("Esa materia no es tuya");
    if (!COURSES.some((course) => course.id === student.study_id)) throw new Error("Programa desconocido");
    await sql`
      insert into course_grades (user_id, course_id, score, comment, graded_by)
      values (${data.userId}, ${student.study_id}, ${data.score}, ${data.comment}, ${context.userId})
      on conflict (user_id, course_id)
      do update set score = excluded.score, comment = excluded.comment, graded_by = excluded.graded_by, updated_at = now()
    `;
    return { ok: true as const };
  });
