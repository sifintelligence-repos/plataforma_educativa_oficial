import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useIngress } from "@/components/ingress";
import { COURSES, courseById } from "@/lib/catalog";
import { addClass } from "@/lib/ingress.functions";

export const Route = createFileRoute("/_app/clases")({ component: ClassesPage });

function ClassesPage() {
  const { snapshot, reload } = useIngress();
  const profile = snapshot?.profile;
  const canPost = profile?.role === "ceo" || profile?.role === "profesor";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseId, setCourseId] = useState(profile?.teaches || COURSES[0]?.id || "python");
  const [error, setError] = useState<string | null>(null);
  const courses = profile?.role === "profesor" ? COURSES.filter((course) => course.id === profile.teaches) : COURSES;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await addClass({ data: { courseId, title, body } });
      setTitle("");
      setBody("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se publicó.");
    }
  }

  return (
    <div className="rise">
      <p className="kicker">Clases</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Lo que publica el equipo</h1>
      {profile?.role === "profesor" ? (
        <p className="mt-2 max-w-xl text-sm text-muted">Podés subir clases de tu materia, sumar eventos en la agenda y escribir a tus estudiantes en el aula.</p>
      ) : null}
      {canPost ? (
        <form className="glass mt-5 grid gap-3 p-5" onSubmit={onSubmit}>
          <label className="grid gap-1 text-sm">
            Materia
            <select className="field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Título
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Clase
            <textarea className="field min-h-28" value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          {error ? <p className="text-sm text-brass">{error}</p> : null}
          <button className="btn btn-ink" type="submit">Publicar clase</button>
        </form>
      ) : null}
      <ul className="mt-5 grid gap-3">
        {(snapshot?.classes ?? []).map((item) => (
          <li key={item.id} className="glass p-5">
            <p className="kicker">{courseById(item.courseId)?.title ?? "Programa"}</p>
            <h2 className="mt-2 font-serif text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm">{item.body}</p>
            <p className="mt-3 text-xs text-muted">{item.authorGmail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
