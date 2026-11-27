import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { useIngress } from "@/components/ingress";
import { Ring } from "@/components/ring";
import { APPS, CHANNEL, EVENTS, MATERIALS, courseById, daysUntil, formatDay, professorById, stateLabel } from "@/lib/catalog";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { continueStudy, doneSet, firstName, materialMap, startedProgress } from "@/lib/progress";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  const user = useCurrentUser();
  const { snapshot: ingress } = useIngress();
  const { snapshot, loading, error, reload, toggleRsvp } = useCampus();
  const [hello, setHello] = useState("Hola");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const hour = new Date().getHours();
    setHello(hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches");
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
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
  const clock = now
    ? now.toLocaleString("es-AR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="rise grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Mesa de hoy</p>
          <h1 className="mt-2 text-4xl font-light tracking-tight text-ink md:text-5xl">
            {hello}, {firstName(user?.displayName)}
          </h1>
        </div>
        <p className="pill"><i />{clock}</p>
      </header>

      <section className="glass grid gap-6 p-5 md:grid-cols-[auto_1fr] md:p-7">
        <Ring value={overall.pct} caption="avance" />
        <div className="min-w-0">
          <p className="kicker">{next ? next.course.track : "Academia"}</p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight">{next?.course.title ?? "Academia al día"}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {next
              ? `Siguiente: ${next.lesson.title}. ${professorById(next.course.professorId)?.name}.`
              : "No queda una lección abierta."}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div className="track flex-1"><span style={{ width: `${next?.progress.pct ?? overall.pct}%` }} /></div>
            <span className="mono text-xs tabular-nums text-muted">{next?.progress.pct ?? overall.pct}%</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {next ? (
              <Link to="/cursos/$courseId" params={{ courseId: next.course.id }} className="btn btn-ink">
                Entrar al estudio
              </Link>
            ) : null}
            <Link to="/perfil" className="btn btn-ghost">Perfil</Link>
            {role === "ceo" ? <Link to="/direccion" className="btn btn-ghost">Dirección</Link> : null}
          </div>
        </div>
      </section>

      <section className="glass grid grid-cols-3 divide-x divide-white/10">
        <Stat value={String(missing.length).padStart(2, "0")} label="faltan en carpeta" />
        <Stat value={upcoming ? String(upcoming.days).padStart(2, "0") : "—"} label="días a la cita" />
        <Stat value={CHANNEL.views28} label="vistas, 28 días" />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="glass p-5 lg:col-span-5">
          <div className="flex items-baseline justify-between">
            <p className="kicker">Carpeta</p>
            <Link to="/materiales" className="mono text-[11px] tracking-wide text-brass">Abrir</Link>
          </div>
          <ul className="mt-4 grid gap-3">
            {missing.length === 0 ? <li className="text-sm text-muted">Nada pendiente en este programa.</li> : null}
            {missing.slice(0, 4).map((material) => (
              <li key={material.id} className="flex items-start justify-between gap-3 border-t border-white/8 pt-3 text-sm first:border-0 first:pt-0">
                <MaterialTitle id={material.id} />
                <span className="mono shrink-0 text-[10px] tracking-wider text-brass uppercase">{stateLabel(states.get(material.id) ?? "missing")}</span>
              </li>
            ))}
          </ul>
        </section>

        {upcoming ? (
          <section className="glass flex gap-4 p-5 lg:col-span-4">
            <div className="min-w-14">
              <p className="text-4xl font-light tabular-nums leading-none">{formatDay(upcoming.event.date).day}</p>
              <p className="mono mt-2 text-[10px] tracking-[0.16em] text-muted uppercase">{formatDay(upcoming.event.date).month}</p>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-medium leading-tight tracking-tight">{upcoming.event.title}</h2>
              <p className="mt-1 text-sm text-muted">{upcoming.event.time} · {upcoming.event.place}</p>
              <button type="button" className="btn btn-ghost mt-4" onClick={() => toggleRsvp(upcoming.event.id, !going)}>
                {going ? "Quitar de mi agenda" : "Confirmar asistencia"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="glass p-5 lg:col-span-3">
          <p className="kicker">Aula</p>
          {last ? (
            <>
              <p className="mono mt-3 text-[10px] tracking-widest text-brass uppercase">{professorById(last.professorId)?.name}</p>
              <p className="mt-2 text-lg font-light leading-snug">{last.body}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">El aula está en silencio. El primer mensaje abre la mesa.</p>
          )}
          <Link to="/aula" className="mono mt-4 inline-block text-[11px] tracking-wide text-brass">Escribir</Link>
        </section>
      </div>

      <section className="glass grid sm:grid-cols-2 lg:grid-cols-4">
        {APPS.map((app, index) => (
          <Link key={app.id} to="/apps/$appId" params={{ appId: app.id }} className="group border-white/8 p-5 sm:[&:nth-child(n+3)]:border-t lg:border-t-0 lg:[&:not(:first-child)]:border-l">
            <p className="mono text-[10px] tracking-[0.16em] text-muted">0{index + 1}</p>
            <h3 className="mt-3 text-xl font-medium tracking-tight group-hover:text-brass">{app.title}</h3>
            <p className="mt-1 text-sm text-muted">{app.promise}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-4 md:px-5">
      <p className="text-3xl font-light tabular-nums tracking-tight md:text-4xl">{value}</p>
      <p className="mono mt-1 text-[10px] tracking-[0.12em] text-muted uppercase">{label}</p>
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
