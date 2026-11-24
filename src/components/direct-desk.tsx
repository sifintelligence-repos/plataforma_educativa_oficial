import { useEffect, useState } from "react";
import { useIngress } from "@/components/ingress";
import { loadThread, sendDirect, type DirectMessage } from "@/lib/ingress.functions";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export function DirectDesk() {
  const { snapshot } = useIngress();
  const me = useCurrentUser();
  const contacts = snapshot?.contacts ?? [];
  const [who, setWho] = useState(contacts[0]?.userId ?? "");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const person = contacts.find((item) => item.userId === who) ?? contacts[0];

  useEffect(() => {
    if (!person) return;
    let cancelled = false;
    loadThread({ data: { userId: person.userId } })
      .then((rows) => {
        if (!cancelled) setMessages(rows);
      })
      .catch(() => {
        if (!cancelled) setError("No se abrió la conversación.");
      });
    return () => {
      cancelled = true;
    };
  }, [person?.userId]);

  if (!person) return null;

  async function send() {
    const body = text.trim();
    if (!body || !person) return;
    setError(null);
    try {
      await sendDirect({ data: { userId: person.userId, body } });
      setMessages((prev) => [...prev, { id: Date.now(), fromUser: me?.id ?? "", body }]);
      setText("");
    } catch {
      setError("No salió el mensaje.");
    }
  }

  return (
    <section className="mt-6">
      <p className="kicker">Programa</p>
      <h2 className="mt-2 font-serif text-3xl">Charla con tu gente</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-[16rem_1fr]">
        <ul className="grid gap-2">
          {contacts.map((item) => (
            <li key={item.userId}>
              <button
                type="button"
                className={item.userId === person.userId ? "glass w-full px-3 py-3 text-left ring-1 ring-brass" : "glass w-full px-3 py-3 text-left"}
                onClick={() => setWho(item.userId)}
              >
                <span className="block font-medium">{item.name}</span>
                <span className="block text-xs text-muted">{item.role} · {item.gmail}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="glass flex min-h-80 flex-col p-4">
          <div className="flex flex-1 flex-col gap-2">
            {messages.map((message) => (
              <p
                key={message.id}
                className={message.fromUser === me?.id ? "ml-8 rounded-2xl bg-ink px-3 py-2 text-sm text-on-ink" : "mr-8 rounded-2xl bg-white/10 px-3 py-2 text-sm"}
              >
                {message.body}
              </p>
            ))}
          </div>
          {error ? <p className="mt-2 text-sm text-brass">{error}</p> : null}
          <div className="mt-3 flex gap-2">
            <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Escribir a ${person.name}`} />
            <button type="button" className="btn btn-ink" onClick={() => void send()}>Enviar</button>
          </div>
        </div>
      </div>
    </section>
  );
}
