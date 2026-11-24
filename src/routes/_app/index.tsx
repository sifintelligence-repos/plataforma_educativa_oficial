import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { useIngress } from "@/components/ingress";
import { APPS, CHANNEL, EVENTS, FIRM, MATERIALS, courseById, daysUntil, formatDay, professorById, stateLabel } from "@/lib/catalog";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { continueStudy, doneSet, firstName, materialMap, startedProgress } from "@/lib/progress";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  const user = useCurrentUser();
  const { snapshot: ingress } = useIngress();
  const { snapshot, loading, error, reload, toggleRsvp } = useCampus();
  const [hello, setHello] = useState("Hola");
  useEffect(() => {
    const hour = new Date().getHours();
    setHello(hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches");
  }, []);

  if (loading || !snapshot) {
    return <p className="text-sm text-muted">{error ? error : "Cargando tu mesa…"} {error ? <button className="btn btn-ghost" type="button" onClick={reload}>Reintentar</button> : null}</p>;
  }

  const role = ingress?.profile?.role;
  const focusId = role === "profesor" ? ingress?.profile?.teaches : ingress?.profile?.studyId;
  const folder = role === "ceo" ? MATERIALS : MATERIALS.filter((item) => item.courseId === focusId);
  const done = doneSet(snapshot.lessons);
  const overall = startedProgress(done);
  const next = continueStudy(done, focusId);
  const states = materialMap(snapshot.materials);
  const missing = folder.filter((item) => states.get(item.id) === "missing");
  const upcoming = EVENTS.map((event) => ({ event, days: daysUntil(event.date) }))
    .filter((row) => row.days >= 0)
    .sort((a, b) => a.days - b.days)[0];
  const going = upcoming ? snapshot.rsvps.some((row) => row.eventId === upcoming.event.id && row.going) : false;
  const last = snapshot.messages[snapshot.messages.length - 1];
  const spark = CHANNEL.series.map((point) => point.views);

  return (
    <div className="rise grid gap-4">
      <header>
        <p className="kicker">{FIRM}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink md:text-5xl">
          {hello}, {firstName(user?.displayName)}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Tu mesa de hoy: el estudio abierto, lo que falta en la carpeta y lo que viene en la agenda.
        </p>
      </header>

      <section className="glass grid grid-cols-3 divide-x divide-line">
        <Stat value={`${overall.pct}%`} label="de lo que empezaste" />
        <Stat value={String(missing.length)} label="materiales faltan" />
        <Stat value={upcoming ? `${upcoming.days} d` : "—"} label="para la próxima cita" />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="glass p-6 lg:col-span-7 md:p-8">
          <p className="kicker">Continúa</p>
          {next ? (
            <>
              <h2 className="mt-2 font-serif text-3xl">{next.course.title}</h2>
              <p className="mt-2 text-sm text-muted">
                Siguiente lección: {next.lesson.title}. {professorById(next.course.professorId)?.name}.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="track flex-1">
                  <span style={{ width: `${next.progress.pct}%` }} />
                </div>
                <span className="text-sm tabular-nums text-muted">{next.progress.pct}%</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/cursos/$courseId" params={{ courseId: next.course.id }} className="btn btn-ink">
                  Entrar al estudio
                </Link>
                <Link to="/perfil" className="btn btn-ghost">
                  Mi perfil
                </Link>
                {role === "ceo" ? (
                  <Link to="/direccion" className="btn btn-ghost">
                    Admin
                  </Link>
                ) : null}
              </div>
            </>
          ) : (
            <h2 className="mt-2 font-serif text-3xl">Academia al día</h2>
          )}
        </section>

        <section className="glass p-6 lg:col-span-5">
          <p className="kicker">Falta en tu carpeta</p>
          <ul className="mt-3 grid gap-2">
            {missing.length === 0 ? <li className="text-sm text-muted">La carpeta de este programa está completa.</li> : null}
            {missing.slice(0, 4).map((material) => {
              return (
                <li key={material.id} className="flex items-start justify-between gap-3 text-sm">
                  <MaterialTitle id={material.id} />
                  <span className="shrink-0 text-xs text-brass">{stateLabel(states.get(material.id) ?? "missing")}</span>
                </li>
              );
            })}
          </ul>
          <Link to="/materiales" className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            Ver materiales
          </Link>
        </section>

        {upcoming ? (
          <section className="glass flex gap-4 p-6 lg:col-span-4">
            <div>
              <p className="font-serif text-4xl tabular-nums leading-none">{formatDay(upcoming.event.date).day}</p>
              <p className="kicker mt-1">{formatDay(upcoming.event.date).month}</p>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-2xl leading-tight">{upcoming.event.title}</h2>
              <p className="mt-1 text-sm text-muted">{upcoming.event.time} · {upcoming.event.place}</p>
              <button
                type="button"
                className="btn btn-ghost mt-3"
                onClick={() => toggleRsvp(upcoming.event.id, !going)}
              >
                {going ? "Quitar de mi agenda" : "Asistiré"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="glass p-6 lg:col-span-4">
          <p className="kicker">{CHANNEL.name}</p>
          <p className="mt-2 font-serif text-4xl tabular-nums">{CHANNEL.views28}</p>
          <p className="text-sm text-muted">vistas en 28 días</p>
          {spark.length > 1 ? <Spark values={spark} /> : <p className="my-3 text-sm text-muted">Sin cifras cargadas.</p>}
          <Link to="/canal" className="text-sm font-medium underline-offset-4 hover:underline">Ver el canal</Link>
        </section>

        <section className="glass p-6 lg:col-span-4">
          <p className="kicker">Aula</p>
          {last ? (
            <>
              <p className="mt-2 text-sm text-muted">{professorById(last.professorId)?.name}</p>
              <p className="mt-1 font-serif text-xl leading-snug">{last.body}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Todavía no hay notas del aula.</p>
          )}
          <Link to="/aula" className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            Escribir al profesor
          </Link>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {APPS.map((app) => (
          <Link key={app.id} to="/apps/$appId" params={{ appId: app.id }} className="glass block p-4">
            <p className="kicker">App</p>
            <h3 className="mt-1 font-serif text-2xl">{app.title}</h3>
            <p className="mt-1 text-sm text-muted">{app.promise}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 py-4 md:px-5">
      <p className="font-serif text-3xl tabular-nums md:text-4xl">{value}</p>
      <p className="text-xs text-muted md:text-sm">{label}</p>
    </div>
  );
}

function MaterialTitle({ id }: { id: string }) {
  const material = MATERIALS.find((item) => item.id === id);
  const course = material ? courseById(material.courseId) : undefined;
  return (
    <span>
      <span className="block">{material?.title ?? id}</span>
      <span className="text-xs text-muted">{course?.title}</span>
    </span>
  );
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 220;
  const h = 48;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * w;
      const y = h - ((value - min) / (max - min || 1)) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="my-3 h-12 w-full text-ink" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}
