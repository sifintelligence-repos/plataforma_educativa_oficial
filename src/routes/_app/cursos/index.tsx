import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { COURSES, professorById } from "@/lib/catalog";
import { courseProgress, doneSet } from "@/lib/progress";

export const Route = createFileRoute("/_app/cursos/")({ component: CoursesPage });

function CoursesPage() {
  const { snapshot, loading, error, reload } = useCampus();
  const tracks = useMemo(() => ["Todos", ...new Set(COURSES.map((course) => course.track))], []);
  const [track, setTrack] = useState("Todos");
  if (loading || !snapshot) {
    return <p className="text-sm text-muted">{error ?? "Cargando estudios…"} {error ? <button className="btn btn-ghost" onClick={reload} type="button">Reintentar</button> : null}</p>;
  }
  const done = doneSet(snapshot.lessons);
  const list = COURSES.filter((course) => track === "Todos" || course.track === track);
  const open = COURSES.filter((course) => course.status === "abierta").length;
  return (
    <div className="rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Catálogo</p>
          <h1 className="mt-2 text-4xl font-light tracking-tight md:text-5xl">Programas</h1>
        </div>
        <p className="pill"><i />{String(open).padStart(2, "0")} abiertos</p>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tracks.map((item) => (
          <button
            key={item}
            type="button"
            className={item === track ? "btn btn-ink shrink-0" : "btn btn-ghost shrink-0"}
            onClick={() => setTrack(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <ol className="glass mt-4 divide-y divide-white/8">
        {list.map((course) => {
          const progress = courseProgress(course.id, done);
          const professor = professorById(course.professorId);
          return (
            <li key={course.id}>
              <Link to="/cursos/$courseId" params={{ courseId: course.id }} className="group grid gap-3 p-4 transition-colors hover:bg-white/3 sm:grid-cols-[3.5rem_1fr_8rem] sm:items-center sm:px-5">
                <span className="mono text-sm text-brass">{course.index}</span>
                <span className="min-w-0">
                  <span className="block text-lg font-medium tracking-tight group-hover:text-brass">{course.title}</span>
                  <span className="mt-1 block text-sm text-muted">{professor?.name} · {course.level} · {course.hours}</span>
                </span>
                <span className="sm:text-right">
                  <span className="mono block text-xs tabular-nums">{course.status === "pronto" ? "Pronto" : `${progress.pct}%`}</span>
                  <span className="mt-1 block text-xs text-muted">{course.price}</span>
                  <span className="track mt-2"><span style={{ width: `${progress.pct}%` }} /></span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
