import { createFileRoute } from "@tanstack/react-router";
import { useCampus } from "@/components/campus";
import { useIngress } from "@/components/ingress";
import { MATERIALS, courseById, materialAction, nextMaterialState, stateLabel, type MaterialState } from "@/lib/catalog";
import { materialMap } from "@/lib/progress";

export const Route = createFileRoute("/_app/materiales")({ component: MaterialsPage });

const GROUPS: { state: MaterialState; title: string; copy: string }[] = [
  { state: "missing", title: "Falta", copy: "Todavía no está en tu carpeta." },
  { state: "review", title: "En revisión", copy: "Lo tienes, y la mesa todavía no lo da por cerrado." },
  { state: "ok", title: "En tu carpeta", copy: "Listo para citar o usar." },
];

function MaterialsPage() {
  const { snapshot: ingress } = useIngress();
  const { snapshot, loading, error, reload, cycleMaterial } = useCampus();
  if (loading || !snapshot) {
    return <p className="text-sm text-muted">{error ?? "Cargando materiales…"} {error ? <button className="btn btn-ghost" type="button" onClick={reload}>Reintentar</button> : null}</p>;
  }
  const states = materialMap(snapshot.materials);
  const role = ingress?.profile?.role;
  const focusId = role === "profesor" ? ingress?.profile?.teaches : ingress?.profile?.studyId;
  const folder = role === "ceo" ? MATERIALS : MATERIALS.filter((item) => item.courseId === focusId);
  return (
    <div className="rise">
      <p className="kicker">Carpeta</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Qué tienes y qué falta</h1>
      <div className="mt-6 grid gap-5">
        {GROUPS.map((group) => {
          const items = folder.filter((material) => states.get(material.id) === group.state);
          return (
            <section key={group.state}>
              <h2 className="font-serif text-3xl">{group.title}</h2>
              <p className="text-sm text-muted">{group.copy}</p>
              <ul className="mt-3 grid gap-2">
                {items.length === 0 ? <li className="text-sm text-muted">Nada en este grupo.</li> : null}
                {items.map((material) => (
                  <li key={material.id} className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{material.title}</span>
                      <span className="text-xs text-muted">
                        {material.kind} · {courseById(material.courseId)?.title} · {stateLabel(group.state)}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => cycleMaterial(material.id, nextMaterialState(group.state))}
                    >
                      {materialAction(group.state)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
