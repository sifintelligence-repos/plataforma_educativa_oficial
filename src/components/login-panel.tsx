import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { COHORT, FIRM, TAGLINE } from "@/lib/catalog";

export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"enter" | "create">("enter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [social, setSocial] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setSocial(host.endsWith(".grok-sandbox.com"));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim().toLowerCase().endsWith("@gmail.com") || password.length < 8) {
      setError("Usá un Gmail y una clave de al menos 8 caracteres.");
      return;
    }
    if (mode === "create" && name.trim().length < 2) {
      setError("Escribe tu nombre para la academia.");
      return;
    }
    setPending(true);
    const result =
      mode === "create"
        ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim() })
        : await authClient.signIn.email({ email: email.trim(), password });
    setPending(false);
    if (result.error) {
      const message = result.error.message ?? "";
      if (/exist/i.test(message)) setError("Esa cuenta ya existe. Entra con tu correo.");
      else if (/invalid|credential|password/i.test(message)) setError("Correo o clave incorrectos.");
      else setError("No pudimos entrar. Revisa los datos e inténtalo de nuevo.");
      return;
    }
    await router.invalidate();
    await router.navigate({ to: "/" });
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="glass grid w-full max-w-4xl overflow-hidden md:grid-cols-2">
        <section className="flex flex-col justify-between gap-8 p-6 md:p-8">
          <div>
            <p className="kicker">{COHORT}</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">{FIRM}</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {TAGLINE} Entrá a la Academia para ver tus programas, lo que falta en la carpeta y el aula con el equipo.
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-ink">
            <li className="paper px-3 py-2">18 programas, de Python al kernel</li>
            <li className="paper px-3 py-2">Informes, OSINT, ventas y marketing</li>
            <li className="paper px-3 py-2">Aula con Exequiel, Dante, Alan y Gabi</li>
          </ul>
        </section>
        <section className="border-t border-line bg-white/5 p-6 md:border-l md:border-t-0 md:p-8">
          <h2 className="font-serif text-3xl">{mode === "create" ? "Crear cuenta" : "Entrar al campus"}</h2>
          <p className="mt-1 text-sm text-muted">Tu mesa queda guardada en tu cuenta.</p>
          <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
            {mode === "create" ? (
              <label className="grid gap-1 text-sm">
                Nombre
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              Gmail
              <input
                className="field"
                type="email"
                value={email}
                placeholder="tunombre@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Clave
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "create" ? "new-password" : "current-password"}
              />
            </label>
            {error ? <p className="text-sm text-brass">{error}</p> : null}
            <button className="btn btn-ink mt-1" type="submit" disabled={pending}>
              {pending ? "Entrando…" : mode === "create" ? "Crear mi mesa" : "Entrar"}
            </button>
          </form>
          <button
            type="button"
            className="mt-3 text-sm text-muted underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "create" ? "enter" : "create");
              setError(null);
            }}
          >
            {mode === "create" ? "Ya tengo cuenta" : "Soy nuevo en la academia"}
          </button>
          {social ? (
            <>
              <div className="my-5 h-px bg-line" />
              <div className="grid gap-2">
                {GROK_PROVIDERS.map((provider) => (
                  <button
                    key={provider.providerId}
                    type="button"
                    className="btn btn-ghost w-full"
                    onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
                  >
                    Continuar con {provider.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">
              En esta laptop entrá con Gmail y clave. Google y X no aceptan esta dirección.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
