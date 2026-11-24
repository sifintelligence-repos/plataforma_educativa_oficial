import { createFileRoute, Link } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { COURSES, professorById } from "@/lib/catalog";
import { courseProgress, doneSet } from "@/lib/progress";

export const Route = createFileRoute("/_app/cursos/")({ component: CoursesPage });

function CoursesPage() {
  const { snapshot, loading, error, reload } = useCampus();
  if (loading || !snapshot) {
    return <p className="text-sm text-muted">{error ?? "Cargando estudios…"} {error ? <button className="btn btn-ghost" onClick={reload} type="button">Reintentar</button> : null}</p>;
  }
  const done = doneSet(snapshot.lessons);
  return (
    <div className="rise">
      <p className="kicker">Estudios</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Programas de la Academia</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Los 18 programas de SIF. Preinscripción abierta, salvo Rust, que sigue en preparación. Precios orientativos por alumno.
      </p>
      <ol className="mt-6 grid gap-3">
        {COURSES.map((course) => {
          const progress = courseProgress(course.id, done);
          const professor = professorById(course.professorId);
          return (
            <li key={course.id}>
              <Link to="/cursos/$courseId" params={{ courseId: course.id }} className="glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span className="font-serif text-3xl text-brass tabular-nums">{course.index}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-2xl">{course.title}</span>
                  <span className="mt-1 block text-sm text-muted">{course.summary}</span>
                  <span className="mt-2 block text-xs text-muted">
                    {professor?.name} · {course.track} · {course.level} · {course.hours}
                    {course.status === "pronto" ? " · Próximamente" : ""}
                  </span>
                  <span className="mt-1 block text-xs text-brass">{course.price}</span>
                </span>
                <span className="w-full sm:w-36">
                  <span className="mb-1 block text-right text-sm tabular-nums">{progress.pct}%</span>
                  <span className="track"><span style={{ width: `${progress.pct}%` }} /></span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
