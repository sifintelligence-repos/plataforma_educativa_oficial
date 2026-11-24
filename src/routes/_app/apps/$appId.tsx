import { createFileRoute, Link } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { AtlasStudio, BriefingStudio, FuentesStudio, IndicadoresStudio } from "@/components/studios";
import { APPS } from "@/lib/catalog";

export const Route = createFileRoute("/_app/apps/$appId")({ component: AppPage });

function AppPage() {
  const { appId } = Route.useParams();
  const app = APPS.find((item) => item.id === appId);
  const { loading, error, reload, snapshot } = useCampus();
  if (!app) {
    return (
      <div className="glass p-6">
        <p>Esa app no está en la firma.</p>
        <Link to="/apps" className="btn btn-ghost mt-4">Volver</Link>
      </div>
    );
  }
  return (
    <div className="rise">
      <Link to="/apps" className="text-sm text-muted underline-offset-4 hover:underline">Apps</Link>
      <p className="kicker mt-3">Herramienta</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">{app.title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">{app.promise}</p>
      <div className="mt-6">
        {loading || !snapshot ? (
          <p className="text-sm text-muted">
            {error ?? "Abriendo la herramienta…"}{" "}
            {error ? <button className="btn btn-ghost" type="button" onClick={reload}>Reintentar</button> : null}
          </p>
        ) : appId === "briefing" ? (
          <BriefingStudio />
        ) : appId === "atlas" ? (
          <AtlasStudio />
        ) : appId === "fuentes" ? (
          <FuentesStudio />
        ) : appId === "indicadores" ? (
          <IndicadoresStudio />
        ) : null}
      </div>
    </div>
  );
}
