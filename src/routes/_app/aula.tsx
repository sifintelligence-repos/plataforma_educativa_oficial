import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DirectDesk } from "@/components/direct-desk";
import { useCampus } from "@/components/campus";
import { useIngress } from "@/components/ingress";
import { PROFESSORS } from "@/lib/catalog";

export const Route = createFileRoute("/_app/aula")({ component: AulaPage });

function AulaPage() {
  const { snapshot: ingress } = useIngress();
  const role = ingress?.profile?.role;
  const { snapshot, loading, error, reload, postMessage } = useCampus();
  const [who, setWho] = useState("exequiel");
  const [narrow, setNarrow] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const professor = PROFESSORS.find((item) => item.id === who) ?? PROFESSORS[0];
  const messages = snapshot?.messages.filter((message) => message.professorId === who) ?? [];

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, who]);

  if (loading || !snapshot || !professor) {
    return <p className="text-sm text-muted">{error ?? "Abriendo el aula…"} {error ? <button className="btn btn-ghost" type="button" onClick={reload}>Reintentar</button> : null}</p>;
  }

  async function send() {
    const body = text.trim();
    if (!body || !professor) return;
    setSending(true);
    setSendError(null);
    try {
      await postMessage(professor.id, body);
      setText("");
    } catch {
      setSendError("No salió el mensaje. Inténtalo otra vez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rise">
      <p className="kicker">Aula</p>
      <h1 className="mt-2 font-serif text-4xl">Charla con la mesa</h1>
      {role === "estudiante" || role === "ceo" ? (
        <div className="mt-5 grid gap-3 md:grid-cols-[16rem_1fr]">
          <ul className={narrow ? "hidden gap-2 md:grid" : "grid gap-2"}>
            {PROFESSORS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === who ? "glass w-full px-3 py-3 text-left ring-1 ring-ink/15" : "glass w-full px-3 py-3 text-left"}
                  onClick={() => {
                    setWho(item.id);
                    setNarrow(true);
                  }}
                >
                  <span className="block font-medium">{item.name}</span>
                  <span className="block text-xs text-muted">{item.role}</span>
                </button>
              </li>
            ))}
          </ul>
          <section className={narrow ? "glass flex min-h-[28rem] flex-col p-4" : "glass hidden min-h-[28rem] flex-col p-4 md:flex"}>
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <button type="button" className="text-sm text-muted md:hidden" onClick={() => setNarrow(false)}>
                Profesores
              </button>
              <div>
                <p className="font-medium">{professor.name}</p>
                <p className="text-xs text-muted">{professor.focus}</p>
              </div>
            </div>
            <div ref={scroller} className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {messages.map((message) => (
                <p
                  key={message.id}
                  className={
                    message.sender === "student"
                      ? "ml-8 rounded-2xl bg-ink px-3 py-2 text-sm text-on-ink"
                      : "mr-8 rounded-2xl bg-white/10 px-3 py-2 text-sm"
                  }
                >
                  {message.body}
                </p>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <label className="sr-only" htmlFor="note">Mensaje</label>
              <textarea
                id="note"
                className="field min-h-11 flex-1"
                value={text}
                maxLength={800}
                placeholder={`Escribe a ${professor.name.split(" ").slice(-1)}`}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="button" className="btn btn-ink self-end" disabled={sending} onClick={send}>
                {sending ? "…" : "Enviar"}
              </button>
            </div>
            {sendError ? <p className="mt-2 text-sm text-brass">{sendError}</p> : null}
          </section>
        </div>
      ) : (
        <p className="mt-2 max-w-xl text-sm text-muted">Desde acá escribís a quienes cursan tu materia.</p>
      )}
      <DirectDesk />
    </div>
  );
}
