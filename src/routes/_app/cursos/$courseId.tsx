import { createFileRoute, Link } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { courseById, lessonsFor, professorById } from "@/lib/catalog";
import { courseProgress, doneSet } from "@/lib/progress";

export const Route = createFileRoute("/_app/cursos/$courseId")({ component: CoursePage });

function CoursePage() {
  const { courseId } = Route.useParams();
  const course = courseById(courseId);
  const { snapshot, loading, error, reload, toggleLesson } = useCampus();
  if (!course) {
    return (
      <div className="glass p-6">
        <p>Ese programa no está en la Academia.</p>
        <Link to="/cursos" className="btn btn-ghost mt-4">Volver</Link>
      </div>
    );
  }
  if (loading || !snapshot) {
    return <p className="text-sm text-muted">{error ?? "Cargando el estudio…"} {error ? <button className="btn btn-ghost" type="button" onClick={reload}>Reintentar</button> : null}</p>;
  }
  const done = doneSet(snapshot.lessons);
  const progress = courseProgress(course.id, done);
  const professor = professorById(course.professorId);
  const lessons = lessonsFor(course.id);
  return (
    <div className="rise">
      <Link to="/cursos" className="text-sm text-muted underline-offset-4 hover:underline">Estudios</Link>
      <p className="kicker mt-3">{course.index} · {course.level}</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">{course.title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">{course.summary}</p>
      <p className="mt-2 text-sm">{professor?.name} · {professor?.role} · {course.hours} · {course.price}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="track max-w-sm flex-1"><span style={{ width: `${progress.pct}%` }} /></div>
        <span className="text-sm tabular-nums">{progress.n}/{progress.total}</span>
      </div>
      <ol className="mt-6 grid gap-2">
        {lessons.map((lesson, index) => {
          const on = done.has(lesson.id);
          return (
            <li key={lesson.id} className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <span className="font-serif text-2xl text-brass tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg">{lesson.title}</span>
                <span className="text-xs text-muted">{lesson.minutes} min · {on ? "Vista" : "Pendiente"}</span>
              </span>
              <button type="button" className={on ? "btn btn-ghost" : "btn btn-ink"} onClick={() => toggleLesson(lesson.id, !on)}>
                {on ? "Marcar pendiente" : "Marcar vista"}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
