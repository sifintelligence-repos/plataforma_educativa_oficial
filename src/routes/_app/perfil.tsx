import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useIngress } from "@/components/ingress";
import { getCampus } from "@/lib/campus.functions";
import { getProfileBoard, markAttendance, setGrade, type ProfileSignal } from "@/lib/profile.functions";

export const Route = createFileRoute("/_app/perfil")({ component: ProfilePage });

function ProfilePage() {
  const { snapshot } = useIngress();
  const role = snapshot?.profile?.role ?? "estudiante";
  const [mine, setMine] = useState<ProfileSignal | null>(null);
  const [roster, setRoster] = useState<ProfileSignal[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      await getCampus();
      const board = await getProfileBoard();
      setMine(board.mine);
      setRoster(board.roster);
      setError("");
    } catch {
      setError("No pudimos abrir tu perfil.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function checkIn() {
    setBusy(true);
    try {
      await markAttendance();
      await load();
    } catch {
      setError("No se pudo marcar la asistencia.");
    } finally {
      setBusy(false);
    }
  }

  if (!mine) {
    return <p className="text-sm text-muted">{error || "Abriendo tu perfil…"}</p>;
  }

  return (
    <div className="rise grid gap-4">
      <header>
        <p className="kicker">Mi perfil</p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">{mine.name}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          {role === "estudiante"
            ? `${mine.courseTitle}. La racha cuenta días seguidos. La nota oficial la carga el profesor. El potencial junta avance, nota y racha.`
            : "Tu asistencia en la mesa. Abajo están los estudiantes, con racha, progreso, potencial y la nota que podés cargar."}
        </p>
      </header>

      <section className="glass overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Señal</th>
              <th className="px-4 py-3 font-medium">Hoy</th>
              <th className="px-4 py-3 font-medium">Lectura</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <td className="px-4 py-4">Racha de asistencias</td>
              <td className="px-4 py-4 font-serif text-2xl tabular-nums">{mine.streak} d</td>
              <td className="px-4 py-4 text-muted">{mine.checkedToday ? "Hoy ya estás" : "Todavía no marcaste hoy"}</td>
            </tr>
            <tr className="border-t border-line">
              <td className="px-4 py-4">Nota</td>
              <td className="px-4 py-4 font-serif text-2xl tabular-nums">{mine.score ?? mine.practice}</td>
              <td className="px-4 py-4 text-muted">
                {mine.score === null ? "Nota de práctica, según lecciones hechas" : mine.comment || "Nota oficial del programa"}
              </td>
            </tr>
            <tr className="border-t border-line">
              <td className="px-4 py-4">Potencial</td>
              <td className="px-4 py-4 font-serif text-2xl text-brass">{mine.potentialLabel}</td>
              <td className="px-4 py-4 text-muted">{mine.potential} de 100</td>
            </tr>
            <tr className="border-t border-line">
              <td className="px-4 py-4">Progreso</td>
              <td className="px-4 py-4 font-serif text-2xl tabular-nums">{role === "estudiante" ? `${mine.pct}%` : "Mesa"}</td>
              <td className="px-4 py-4 text-muted">
                {role !== "estudiante"
                  ? role === "ceo"
                    ? "Podés ver y corregir a toda la academia"
                    : "Podés corregir a quienes cursan tu materia"
                  : mine.total === 0
                    ? "Sin programa asignado"
                    : mine.remaining === 0
                      ? "Programa terminado"
                      : `Faltan ${mine.remaining} de ${mine.total} lecciones`}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="glass p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kicker">Últimos 14 días</p>
            <p className="mt-1 text-sm text-muted">Un punto ámbar es un día con asistencia.</p>
          </div>
          <button type="button" className="btn btn-ink" disabled={busy || mine.checkedToday} onClick={() => void checkIn()}>
            {mine.checkedToday ? "Asistencia de hoy lista" : "Marcar asistencia de hoy"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {mine.days.map((day) => (
            <span
              key={day.day}
              title={day.day}
              className={day.present ? "grid h-9 place-items-center rounded-lg bg-brass text-xs text-on-ink" : "grid h-9 place-items-center rounded-lg border border-line text-xs text-muted"}
            >
              {day.day.slice(8)}
            </span>
          ))}
        </div>
        {role === "estudiante" ? (
          <div className="mt-5">
            <div className="track">
              <span style={{ width: `${mine.pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">Camino hasta terminar {mine.courseTitle}</p>
          </div>
        ) : null}
      </section>

      {mine.lessons.length > 0 ? (
        <section className="glass overflow-hidden">
          <p className="kicker px-4 pt-4">Lecciones</p>
          <table className="mt-2 w-full text-left text-sm">
            <tbody>
              {mine.lessons.map((lesson, index) => (
                <tr key={lesson.id} className="border-t border-line">
                  <td className="px-4 py-3 tabular-nums text-brass">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3">{lesson.title}</td>
                  <td className="px-4 py-3 text-right text-muted">{lesson.done ? "Hecha" : "Pendiente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {role !== "estudiante" ? (
        <section className="glass overflow-x-auto p-4">
          <p className="kicker">Estudiantes</p>
          <h2 className="mt-2 font-serif text-3xl">{role === "ceo" ? "Toda la academia" : "Tu materia"}</h2>
          {roster.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Todavía no hay estudiantes en esta mesa.</p>
          ) : (
            <table className="mt-4 w-full min-w-[40rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2 font-medium">Estudiante</th>
                  <th className="px-2 py-2 font-medium">Racha</th>
                  <th className="px-2 py-2 font-medium">Progreso</th>
                  <th className="px-2 py-2 font-medium">Potencial</th>
                  <th className="px-2 py-2 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((person) => (
                  <GradeRow key={person.userId} person={person} onSaved={load} />
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {error ? <p className="text-sm text-brass">{error}</p> : null}
    </div>
  );
}

function GradeRow({ person, onSaved }: { person: ProfileSignal; onSaved: () => Promise<void> }) {
  const [score, setScore] = useState(person.score === null ? "" : String(person.score));
  const [comment, setComment] = useState(person.comment);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await setGrade({ data: { userId: person.userId, score: Number(score), comment } });
      await onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-t border-line align-top">
      <td className="px-2 py-3">
        <span className="block">{person.name}</span>
        <span className="text-xs text-muted">{person.courseTitle}</span>
      </td>
      <td className="px-2 py-3 tabular-nums">{person.streak} d</td>
      <td className="px-2 py-3 tabular-nums">{person.pct}%</td>
      <td className="px-2 py-3">{person.potentialLabel}</td>
      <td className="px-2 py-3">
        <div className="flex flex-wrap gap-2">
          <input
            className="field w-20"
            inputMode="numeric"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            aria-label={`Nota de ${person.name}`}
          />
          <input
            className="field min-w-40 flex-1"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comentario"
            aria-label={`Comentario de ${person.name}`}
          />
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void save()}>
            Guardar
          </button>
        </div>
      </td>
    </tr>
  );
}
