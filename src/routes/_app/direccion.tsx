import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useIngress } from "@/components/ingress";
import { COURSES, courseById } from "@/lib/catalog";
import { adminUpdatePerson, readDocument, reviewPayment } from "@/lib/ingress.functions";
import type { IngressPerson } from "@/lib/ingress.functions";

export const Route = createFileRoute("/_app/direccion")({ component: DirectionPage });

function DirectionPage() {
  const { snapshot, reload } = useIngress();
  const [doc, setDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (snapshot?.profile?.role !== "ceo") {
    return <p className="text-sm text-muted">Esta sala es solo de dirección.</p>;
  }

  async function review(userId: string, status: "verificado" | "rechazado") {
    setError(null);
    try {
      await reviewPayment({ data: { userId, status } });
      reload();
    } catch {
      setError("No se guardó la revisión.");
    }
  }

  async function openDoc(userId: string) {
    setError(null);
    try {
      const file = await readDocument({ data: { userId } });
      if (!file.dataUrl) {
        setError("Esa persona no subió documento.");
        return;
      }
      setDoc(file);
    } catch {
      setError("No se abrió el documento.");
    }
  }

  return (
    <div className="rise">
      <p className="kicker">Dirección</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Admin total</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Cambiá rol, programa y pago. Los Gmail que entran siempre como CEO se fijan en la configuración de los desarrolladores.
      </p>
      {error ? <p className="mt-3 text-sm text-brass">{error}</p> : null}
      <ul className="mt-5 grid gap-3">
        {snapshot.people.filter((person) => person.gmail !== snapshot.profile?.gmail).length === 0 ? (
          <li className="text-sm text-muted">Todavía no hay otras cuentas. Cuando alguien entre con su Gmail, aparece acá.</li>
        ) : null}
        {snapshot.people
          .filter((person) => person.gmail !== snapshot.profile?.gmail)
          .map((person) => (
          <PersonCard
            key={person.userId}
            person={person}
            onSaved={reload}
            onError={setError}
            onReview={review}
            onDoc={openDoc}
          />
        ))}
      </ul>
      {doc ? (
        <div className="fixed inset-0 z-40 grid place-items-center px-4">
          <button type="button" className="scrim absolute inset-0" aria-label="Cerrar" onClick={() => setDoc(null)} />
          <div className="glass relative max-h-[80vh] max-w-lg overflow-auto p-4">
            <p className="text-sm">{doc.name}</p>
            <img src={doc.dataUrl} alt="Documento de identidad" className="mt-3 max-h-[60vh] rounded-xl" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PersonCard({
  person,
  onSaved,
  onError,
  onReview,
  onDoc,
}: {
  person: IngressPerson;
  onSaved: () => void;
  onError: (message: string | null) => void;
  onReview: (userId: string, status: "verificado" | "rechazado") => void;
  onDoc: (userId: string) => void;
}) {
  const [role, setRole] = useState(person.role);
  const [courseId, setCourseId] = useState(person.studyId ?? person.teaches ?? COURSES[0]?.id ?? "python");
  const [pending, setPending] = useState(false);
  const study = courseById(person.studyId ?? person.teaches ?? "");

  async function save() {
    setPending(true);
    onError(null);
    try {
      await adminUpdatePerson({ data: { userId: person.userId, role, courseId } });
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "No se guardó el cambio.");
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="glass p-5">
      <p className="font-medium">{person.name}</p>
      <p className="text-sm text-muted">
        {person.gmail}
        {person.age > 0 ? ` · ${person.age} años` : ""}
      </p>
      <p className="mt-1 text-sm">
        {study?.title ?? "Sin programa"} · pago {person.paymentStatus}
        {person.paymentRef ? ` · ${person.paymentRef}` : ""}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Rol
          <select className="field" value={role} onChange={(e) => setRole(e.target.value as IngressPerson["role"])}>
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
            <option value="ceo">CEO</option>
          </select>
        </label>
        {role === "ceo" ? null : (
          <label className="grid gap-1 text-sm">
            {role === "profesor" ? "Materia" : "Programa"}
            <select className="field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {COURSES.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ink" disabled={pending} onClick={() => void save()}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {person.role === "estudiante" && person.paymentStatus !== "verificado" ? (
          <button type="button" className="btn btn-ghost" onClick={() => onReview(person.userId, "verificado")}>
            Marcar pago real
          </button>
        ) : null}
        {person.role === "estudiante" && person.paymentStatus === "en_revision" ? (
          <button type="button" className="btn btn-ghost" onClick={() => onReview(person.userId, "rechazado")}>
            Rechazar
          </button>
        ) : null}
        {person.hasDocument ? (
          <button type="button" className="btn btn-ghost" onClick={() => onDoc(person.userId)}>
            Ver documento
          </button>
        ) : null}
      </div>
    </li>
  );
}
