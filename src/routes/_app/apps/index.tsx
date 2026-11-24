import { createFileRoute, Link } from "@tanstack/react-router";
import { APPS } from "@/lib/catalog";

export const Route = createFileRoute("/_app/apps/")({ component: AppsPage });

function AppsPage() {
  return (
    <div className="rise">
      <p className="kicker">Apps de la firma</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Herramientas de la mesa</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Cuatro herramientas de la mesa de SIF: el informe, la decisión, las fuentes públicas y las métricas. Lo que guardás queda en tu cuenta.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/apps/$appId" params={{ appId: "briefing" }} className="paper block p-6">
          <p className="kicker">01</p>
          <h2 className="mt-2 font-serif text-3xl">{APPS[0]?.title}</h2>
          <p className="mt-3 font-serif text-lg text-ink/80">“Una fuente sola no cierra el informe.”</p>
          <p className="mt-3 text-sm text-muted">{APPS[0]?.promise}</p>
        </Link>
        <Link to="/apps/$appId" params={{ appId: "atlas" }} className="glass block p-6">
          <p className="kicker">02</p>
          <h2 className="mt-2 font-serif text-3xl">{APPS[1]?.title}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <span className="paper px-2 py-3">Landing inicial</span>
            <span className="paper px-2 py-3">Sitio institucional</span>
            <span className="paper px-2 py-3">Diagnosticar</span>
            <span className="paper px-2 py-3">Sin alcance</span>
          </div>
        </Link>
        <Link to="/apps/$appId" params={{ appId: "fuentes" }} className="glass block p-6">
          <p className="kicker">03</p>
          <h2 className="mt-2 font-serif text-3xl">{APPS[2]?.title}</h2>
          <p className="mt-3 flex gap-2 text-sm">
            <span className="rounded-full bg-ink px-2 py-1 text-on-ink">A</span>
            <span className="rounded-full bg-ink/80 px-2 py-1 text-on-ink">B</span>
            <span className="rounded-full border border-line px-2 py-1">C</span>
            <span className="rounded-full border border-line px-2 py-1 text-muted">F</span>
          </p>
          <p className="mt-3 text-sm text-muted">{APPS[2]?.promise}</p>
        </Link>
        <Link to="/apps/$appId" params={{ appId: "indicadores" }} className="glass block p-6">
          <p className="kicker">04</p>
          <h2 className="mt-2 font-serif text-3xl">{APPS[3]?.title}</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li className="flex justify-between"><span>Preinscripción</span><span>Abierta</span></li>
            <li className="flex justify-between"><span>Materiales fuera</span><span className="text-brass">Atención</span></li>
            <li className="flex justify-between"><span>Python desplegado</span><span>Revisar</span></li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
