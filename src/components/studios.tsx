import { useState } from "react";
import {
  DEFAULT_ATLAS,
  DEFAULT_BRIEFING,
  DEFAULT_FUENTES,
  DEFAULT_INDICADORES,
  type AtlasNote,
  type BriefingNote,
  type FuentesNote,
  type IndicadoresNote,
  type IndicatorItem,
  type SourceItem,
} from "@/lib/catalog";
import { readPayload } from "@/lib/progress";
import { useCampus } from "@/components/campus";

function useDraft<T>(appId: string, fallback: T) {
  const { snapshot, saveNote } = useCampus();
  const raw = snapshot?.notes.find((note) => note.appId === appId)?.payload;
  const initial = readPayload(raw, fallback);
  const [draft, setDraft] = useState<T>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(next: T) {
    setStatus("saving");
    try {
      await saveNote(appId, JSON.stringify(next));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return { draft, setDraft, save, status };
}

function SaveRow({ status, onSave }: { status: string; onSave: () => void }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button type="button" className="btn btn-ink" onClick={onSave} disabled={status === "saving"}>
        {status === "saving" ? "Guardando…" : "Guardar en mi mesa"}
      </button>
      {status === "saved" ? <span className="text-sm text-muted">Guardado</span> : null}
      {status === "error" ? <span className="text-sm text-brass">No se pudo guardar</span> : null}
    </div>
  );
}

export function BriefingStudio() {
  const { draft, setDraft, save, status } = useDraft<BriefingNote>("briefing", DEFAULT_BRIEFING);
  const set = (key: keyof BriefingNote, value: string) => setDraft({ ...draft, [key]: value });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-3">
        <Field label="Pregunta" value={draft.question} onChange={(value) => set("question", value)} />
        <Field label="Juicio" value={draft.judgment} onChange={(value) => set("judgment", value)} />
        <Field label="Evidencia" value={draft.evidence} onChange={(value) => set("evidence", value)} />
        <Field label="Límite" value={draft.caveat} onChange={(value) => set("caveat", value)} />
        <label className="grid gap-1 text-sm">
          Audiencia
          <input className="field" value={draft.audience} onChange={(e) => set("audience", e.target.value)} />
        </label>
        <SaveRow status={status} onSave={() => save(draft)} />
      </div>
      <article className="paper p-6">
        <p className="kicker">Briefing</p>
        <h2 className="mt-3 font-serif text-3xl">{draft.question || "Sin pregunta"}</h2>
        <p className="mt-4 text-sm uppercase tracking-wide text-brass">Para {draft.audience || "la mesa"}</p>
        <p className="mt-4 font-serif text-2xl leading-snug">{draft.judgment}</p>
        <p className="mt-4 text-sm leading-relaxed">{draft.evidence}</p>
        <p className="mt-4 text-sm text-muted">Límite: {draft.caveat}</p>
      </article>
    </div>
  );
}

export function AtlasStudio() {
  const { draft, setDraft, save, status } = useDraft<AtlasNote>("atlas", DEFAULT_ATLAS);
  const set = (key: keyof AtlasNote, value: string) => setDraft({ ...draft, [key]: value });
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">Eje horizontal<input className="field" value={draft.x} onChange={(e) => set("x", e.target.value)} /></label>
        <label className="grid gap-1 text-sm">Eje vertical<input className="field" value={draft.y} onChange={(e) => set("y", e.target.value)} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Quad label="Arriba izquierda" value={draft.q1} onChange={(value) => set("q1", value)} />
        <Quad label="Arriba derecha" value={draft.q2} onChange={(value) => set("q2", value)} />
        <Quad label="Abajo izquierda" value={draft.q3} onChange={(value) => set("q3", value)} />
        <Quad label="Abajo derecha" value={draft.q4} onChange={(value) => set("q4", value)} />
      </div>
      <SaveRow status={status} onSave={() => save(draft)} />
    </div>
  );
}

export function FuentesStudio() {
  const { draft, setDraft, save, status } = useDraft<FuentesNote>("fuentes", DEFAULT_FUENTES);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("C");
  const [note, setNote] = useState("");
  const items = draft.items ?? [];

  function add() {
    const clean = name.trim();
    if (!clean) return;
    const next: SourceItem = { id: `s${Date.now()}`, name: clean, grade, note: note.trim() };
    setDraft({ items: [next, ...items].slice(0, 12) });
    setName("");
    setNote("");
  }

  return (
    <div className="grid gap-4">
      <div className="glass grid gap-3 p-4 md:grid-cols-[1fr_auto]">
        <label className="grid gap-1 text-sm">
          Fuente
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la fuente" />
        </label>
        <label className="grid gap-1 text-sm">
          Grado
          <select className="field" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {["A", "B", "C", "D", "F"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          Nota
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Por qué ese grado" />
        </label>
        <button type="button" className="btn btn-ghost md:col-span-2" onClick={add}>Añadir ficha</button>
      </div>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="glass flex items-start gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm text-on-ink">{item.grade}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{item.name}</span>
              <span className="block text-sm text-muted">{item.note}</span>
            </span>
            <button
              type="button"
              className="text-sm text-muted underline-offset-4 hover:underline"
              onClick={() => setDraft({ items: items.filter((row) => row.id !== item.id) })}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">A muy sólida · B sólida · C con reservas · D débil · F no usar.</p>
      <SaveRow status={status} onSave={() => save({ items })} />
    </div>
  );
}

export function IndicadoresStudio() {
  const { draft, setDraft, save, status } = useDraft<IndicadoresNote>("indicadores", DEFAULT_INDICADORES);
  const items = draft.items ?? [];
  const order: IndicatorItem["status"][] = ["ok", "watch", "alert"];
  const label = { ok: "Estable", watch: "Atención", alert: "Revisar" };

  function cycle(id: string) {
    setDraft({
      items: items.map((item) => {
        if (item.id !== id) return item;
        const next = order[(order.indexOf(item.status) + 1) % order.length] ?? "ok";
        return { ...item, status: next };
      }),
    });
  }

  return (
    <div>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{item.name}</span>
              <span className="block text-sm text-muted">{item.note}</span>
            </span>
            <button type="button" className="btn btn-ghost" onClick={() => cycle(item.id)}>
              {label[item.status]}
            </button>
          </li>
        ))}
      </ul>
      <SaveRow status={status} onSave={() => save({ items })} />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <textarea className="field min-h-20" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Quad({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="paper grid gap-2 p-4 text-sm">
      <span className="kicker">{label}</span>
      <textarea className="field min-h-20" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
