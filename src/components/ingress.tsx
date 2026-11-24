import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  confirmEntry,
  getIngress,
  type IngressSnapshot,
} from "@/lib/ingress.functions";

type IngressContextValue = {
  snapshot: IngressSnapshot | null;
  reload: () => void;
};

const IngressContext = createContext<IngressContextValue | null>(null);

export function useIngress() {
  const value = useContext(IngressContext);
  if (!value) throw new Error("Ingress fuera de lugar");
  return value;
}

export function IngressProvider({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const [snapshot, setSnapshot] = useState<IngressSnapshot | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getIngress()
      .then((data) => {
        if (!cancelled) setSnapshot(data);
      })
      .catch(() => {
        if (!cancelled) setSnapshot({ profile: null, classes: [], events: [], contacts: [], people: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, tick]);

  const value = useMemo(() => ({ snapshot, reload }), [snapshot, reload]);
  return <IngressContext.Provider value={value}>{children}</IngressContext.Provider>;
}

export function IngressGate({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const { snapshot, reload } = useIngress();

  if (!user || !snapshot) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-muted">Abriendo el ingreso…</p>
      </main>
    );
  }

  if (!snapshot.profile) {
    if (import.meta.env.DEV) return <DevEnter onDone={reload} />;
    return <ConfirmCode email={user.primaryEmail ?? ""} onDone={() => reload()} />;
  }

  return children;
}

function DevEnter({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    confirmEntry({ data: { code: "dev" } })
      .then(() => {
        if (!cancelled) onDone();
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No pudimos abrir la mesa.");
      });
    return () => {
      cancelled = true;
    };
  }, [onDone]);
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <p className="text-sm text-muted">{error ?? "Abriendo tu mesa…"}</p>
    </main>
  );
}

function ConfirmCode({ email, onDone }: { email: string; onDone: () => void }) {
  const gmail = email.trim().toLowerCase();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!gmail.endsWith("@gmail.com")) {
      setError("La cuenta tiene que ser un Gmail.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await confirmEntry({ data: { code } });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos confirmar el código.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <form className="glass w-full max-w-md p-6 md:p-8" onSubmit={onSubmit}>
        <p className="kicker">Confirmación</p>
        <h1 className="mt-2 font-serif text-4xl">Tu Gmail y un código</h1>
        <p className="mt-3 text-sm text-muted">Nada más. Con esto entrás a probar la mesa.</p>
        <p className="paper mt-4 px-3 py-3 text-sm">{gmail || "Sin Gmail"}</p>
        <label className="mt-4 grid gap-1 text-sm">
          Código
          <input
            className="field"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="one-time-code"
            inputMode="text"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-brass">{error}</p> : null}
        <button className="btn btn-ink mt-4" type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
        <button className="btn btn-ghost mt-2" type="button" onClick={() => void signOut()}>
          Salir
        </button>
      </form>
    </main>
  );
}
