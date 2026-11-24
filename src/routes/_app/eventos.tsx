import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { useIngress } from "@/components/ingress";
import { EVENTS, daysUntil, formatDay } from "@/lib/catalog";
import { addAcademyEvent } from "@/lib/ingress.functions";

export const Route = createFileRoute("/_app/eventos")({ component: EventsPage });

function EventsPage() {
  const { snapshot, loading, error, reload, toggleRsvp } = useCampus();
  const { snapshot: ingress, reload: reloadIngress } = useIngress();
  const canPost = ingress?.profile?.role === "profesor" || ingress?.profile?.role === "ceo";
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [detail, setDetail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  if (loading || !snapshot) {
    return <p className="text-sm text-muted">{error ?? "Cargando la agenda…"} {error ? <button className="btn btn-ghost" type="button" onClick={reload}>Reintentar</button> : null}</p>;
  }
  const going = new Set(snapshot.rsvps.filter((row) => row.going).map((row) => row.eventId));
  async function publish(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      await addAcademyEvent({ data: { title, date, time, place, detail } });
      setTitle("");
      setDetail("");
      reloadIngress();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se publicó.");
    }
  }
  return (
    <div className="rise">
      <p className="kicker">Agenda</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Próximos encuentros</h1>
      {canPost ? (
        <form className="glass mt-5 grid gap-3 p-5 md:grid-cols-2" onSubmit={publish}>
          <label className="grid gap-1 text-sm">Título<input className="field" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="grid gap-1 text-sm">Fecha<input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="grid gap-1 text-sm">Hora<input className="field" value={time} placeholder="18:00" onChange={(e) => setTime(e.target.value)} /></label>
          <label className="grid gap-1 text-sm">Lugar<input className="field" value={place} onChange={(e) => setPlace(e.target.value)} /></label>
          <label className="grid gap-1 text-sm md:col-span-2">Detalle<input className="field" value={detail} onChange={(e) => setDetail(e.target.value)} /></label>
          {formError ? <p className="text-sm text-brass md:col-span-2">{formError}</p> : null}
          <button className="btn btn-ink md:col-span-2" type="submit">Publicar evento</button>
        </form>
      ) : null}
      <ol className="mt-6 grid gap-3">
        {(ingress?.events ?? []).map((event) => {
          const day = formatDay(event.date);
          return (
            <li key={`extra-${event.id}`} className="glass flex flex-col gap-4 p-5 sm:flex-row">
              <div className="sm:w-24">
                <p className="font-serif text-4xl tabular-nums leading-none">{day.day}</p>
                <p className="kicker mt-1">{day.month}</p>
              </div>
              <div>
                <h2 className="font-serif text-2xl">{event.title}</h2>
                <p className="mt-1 text-sm text-muted">{event.time} · {event.place}</p>
                <p className="mt-2 text-sm">{event.detail}</p>
                <p className="mt-2 text-xs text-muted">Publicado por {event.authorGmail}</p>
              </div>
            </li>
          );
        })}
        {EVENTS.map((event) => {
          const day = formatDay(event.date);
          const left = daysUntil(event.date);
          const on = going.has(event.id);
          return (
            <li key={event.id} className="glass flex flex-col gap-4 p-5 sm:flex-row">
              <div className="sm:w-24">
                <p className="font-serif text-4xl tabular-nums leading-none">{day.day}</p>
                <p className="kicker mt-1">{day.month}</p>
                <p className="mt-2 text-xs text-muted">{left >= 0 ? `en ${left} días` : "pasado"}</p>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-2xl">{event.title}</h2>
                <p className="mt-1 text-sm text-muted">{event.time} · {event.place}</p>
                <p className="mt-2 text-sm">{event.detail}</p>
                <button type="button" className={on ? "btn btn-ghost mt-4" : "btn btn-ink mt-4"} onClick={() => toggleRsvp(event.id, !on)}>
                  {on ? "Quitar de mi agenda" : "Asistiré"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
