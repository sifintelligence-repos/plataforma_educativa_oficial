import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  APPS,
  EVENTS,
  LESSONS,
  MATERIALS,
  PROFESSORS,
  type MaterialState,
} from "@/lib/catalog";
import { getSql } from "@/lib/db";

export type CampusMessage = {
  id: number;
  professorId: string;
  sender: "student" | "professor";
  body: string;
  createdAt: string;
};

export type CampusSnapshot = {
  lessons: { lessonId: string; done: boolean }[];
  materials: { materialId: string; state: MaterialState }[];
  messages: CampusMessage[];
  rsvps: { eventId: string; going: boolean }[];
  notes: { appId: string; payload: string }[];
};

const REPLIES: Record<string, string[]> = {
  exequiel: [
    "Recibido. Mostrame el error completo y en qué línea se corta.",
    "Si ya corre en local, el siguiente paso es dejarlo desplegado y anotar cómo lo levantaste.",
    "Bien. No agregues features: cerrá esta función y pasá a la siguiente lección.",
    "Python primero, prolijidad después. Nombrá las variables como si otro del equipo las leyera.",
  ],
  dante: [
    "El informe se entiende. Falta decir qué fuente lo sostiene y qué no sabemos.",
    "Una sola fuente orienta, no cierra. Buscá un contraste antes de la próxima clase.",
    "OSINT es información pública y verificable. Si no podés citarla, no entra.",
    "Dejalo en una página. La dirección lee el juicio, no el inventario.",
  ],
  alan: [
    "La pieza tiene que decir a quién le habla y qué tiene que hacer después.",
    "Menos adjetivos, más prueba: un número, un ejemplo, un siguiente paso.",
    "El calendario de la semana está bien. Publicá menos y medí qué se guarda.",
    "Si es para la academia, que se entienda en un minuto.",
  ],
  gabi: [
    "La llamada se practica en voz alta. Si tardás más de un minuto en el motivo, recortala.",
    "Anotá la objeción real, no la que te gustaría escuchar.",
    "Cierre consultivo: preguntá qué necesita decidir, no empujes un sí vacío.",
    "Traé dos prospectos a la próxima práctica, aunque sean de ensayo.",
  ],
};

function replyFor(professorId: string, text: string) {
  const t = text.toLowerCase();
  if (t.includes("plazo") || t.includes("fecha") || t.includes("cuándo") || t.includes("cuando")) {
    return "La preinscripción sigue abierta. La próxima ventana de postulaciones a la firma es en abril. Si necesitás otra fecha de entrega, decímela concreta.";
  }
  if (t.includes("gracias")) {
    return "De nada. Seguí con el siguiente paso chico y lo vemos en el aula.";
  }
  if (t.includes("material") || t.includes("falta") || t.includes("plantilla")) {
    return "Mirá Materiales: lo que figura como «Falta» todavía no cuenta. Cuando lo tengas, pasalo a revisión.";
  }
  const pool = REPLIES[professorId] ?? REPLIES.exequiel;
  return pool[text.length % pool.length] ?? pool[0];
}

function asState(value: string): MaterialState {
  if (value === "ok" || value === "review" || value === "missing") return value;
  return "missing";
}

function asSender(value: string): "student" | "professor" {
  return value === "professor" ? "professor" : "student";
}

async function ensureSeed(userId: string) {
  const sql = await getSql();
  const ready = await sql<{ seed_version: string }>`
    select seed_version from campus_ready where user_id = ${userId}
  `;
  if (ready[0]?.seed_version === "v3") return;

  await sql`delete from lesson_progress where user_id = ${userId}`;
  await sql`delete from material_flags where user_id = ${userId}`;
  await sql`delete from messages where user_id = ${userId}`;
  await sql`delete from event_rsvps where user_id = ${userId}`;
  await sql`delete from app_notes where user_id = ${userId}`;
  await sql`delete from campus_ready where user_id = ${userId}`;

  for (const material of MATERIALS) {
    await sql`
      insert into material_flags (user_id, material_id, state)
      values (${userId}, ${material.id}, ${"missing"})
      on conflict (user_id, material_id) do nothing
    `;
  }
  await sql`
    insert into campus_ready (user_id, seed_version) values (${userId}, ${"v3"})
    on conflict (user_id) do update set seed_version = excluded.seed_version
  `;
}

export const getCampus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CampusSnapshot> => {
    await ensureSeed(context.userId);
    const sql = await getSql();
    const lessons = await sql<{ lesson_id: string; done: boolean }>`
      select lesson_id, done from lesson_progress where user_id = ${context.userId}
    `;
    const materials = await sql<{ material_id: string; state: string }>`
      select material_id, state from material_flags where user_id = ${context.userId}
    `;
    const messages = await sql<{
      id: number;
      professor_id: string;
      sender: string;
      body: string;
      created_at: string;
    }>`
      select id, professor_id, sender, body, created_at::text as created_at
      from messages
      where user_id = ${context.userId}
      order by id asc
    `;
    const rsvps = await sql<{ event_id: string; going: boolean }>`
      select event_id, going from event_rsvps where user_id = ${context.userId}
    `;
    const notes = await sql<{ app_id: string; payload: string }>`
      select app_id, payload from app_notes where user_id = ${context.userId}
    `;
    return {
      lessons: lessons.map((row) => ({ lessonId: row.lesson_id, done: Boolean(row.done) })),
      materials: materials.map((row) => ({ materialId: row.material_id, state: asState(row.state) })),
      messages: messages.map((row) => ({
        id: Number(row.id),
        professorId: row.professor_id,
        sender: asSender(row.sender),
        body: row.body,
        createdAt: row.created_at,
      })),
      rsvps: rsvps.map((row) => ({ eventId: row.event_id, going: Boolean(row.going) })),
      notes: notes.map((row) => ({ appId: row.app_id, payload: row.payload })),
    };
  });

export const setLessonDone = createServerFn({ method: "POST" })
  .validator((input: { lessonId: string; done: boolean }) => {
    const lessonId = String(input?.lessonId ?? "");
    if (!LESSONS.some((lesson) => lesson.id === lessonId)) throw new Error("Lección desconocida");
    return { lessonId, done: Boolean(input?.done) };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into lesson_progress (user_id, lesson_id, done)
      values (${context.userId}, ${data.lessonId}, ${data.done})
      on conflict (user_id, lesson_id)
      do update set done = excluded.done, updated_at = now()
    `;
    return { ok: true as const };
  });

export const setMaterialState = createServerFn({ method: "POST" })
  .validator((input: { materialId: string; state: MaterialState }) => {
    const materialId = String(input?.materialId ?? "");
    if (!MATERIALS.some((material) => material.id === materialId)) throw new Error("Material desconocido");
    const state = asState(String(input?.state ?? ""));
    return { materialId, state };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into material_flags (user_id, material_id, state)
      values (${context.userId}, ${data.materialId}, ${data.state})
      on conflict (user_id, material_id)
      do update set state = excluded.state
    `;
    return { ok: true as const };
  });

export const sendNote = createServerFn({ method: "POST" })
  .validator((input: { professorId: string; body: string }) => {
    const professorId = String(input?.professorId ?? "");
    if (!PROFESSORS.some((professor) => professor.id === professorId)) {
      throw new Error("Profesor desconocido");
    }
    const body = String(input?.body ?? "").trim().slice(0, 800);
    if (!body) throw new Error("Escribe un mensaje");
    return { professorId, body };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ messages: CampusMessage[] }> => {
    const sql = await getSql();
    const student = await sql<{
      id: number;
      professor_id: string;
      sender: string;
      body: string;
      created_at: string;
    }>`
      insert into messages (user_id, professor_id, sender, body)
      values (${context.userId}, ${data.professorId}, ${"student"}, ${data.body})
      returning id, professor_id, sender, body, created_at::text as created_at
    `;
    const answer = replyFor(data.professorId, data.body);
    const professor = await sql<{
      id: number;
      professor_id: string;
      sender: string;
      body: string;
      created_at: string;
    }>`
      insert into messages (user_id, professor_id, sender, body)
      values (${context.userId}, ${data.professorId}, ${"professor"}, ${answer})
      returning id, professor_id, sender, body, created_at::text as created_at
    `;
    return {
      messages: [...student, ...professor].map((row) => ({
        id: Number(row.id),
        professorId: row.professor_id,
        sender: asSender(row.sender),
        body: row.body,
        createdAt: row.created_at,
      })),
    };
  });

export const setRsvp = createServerFn({ method: "POST" })
  .validator((input: { eventId: string; going: boolean }) => {
    const eventId = String(input?.eventId ?? "");
    if (!EVENTS.some((event) => event.id === eventId)) throw new Error("Evento desconocido");
    return { eventId, going: Boolean(input?.going) };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!data.going) {
      await sql`
        delete from event_rsvps where user_id = ${context.userId} and event_id = ${data.eventId}
      `;
    } else {
      await sql`
        insert into event_rsvps (user_id, event_id, going)
        values (${context.userId}, ${data.eventId}, true)
        on conflict (user_id, event_id) do update set going = true
      `;
    }
    return { ok: true as const };
  });

export const saveAppNote = createServerFn({ method: "POST" })
  .validator((input: { appId: string; payload: string }) => {
    const appId = String(input?.appId ?? "");
    if (!APPS.some((app) => app.id === appId)) throw new Error("App desconocida");
    const payload = String(input?.payload ?? "");
    if (payload.length > 8000) throw new Error("El texto es demasiado largo");
    JSON.parse(payload);
    return { appId, payload };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into app_notes (user_id, app_id, payload)
      values (${context.userId}, ${data.appId}, ${data.payload})
      on conflict (user_id, app_id) do update set payload = excluded.payload
    `;
    return { ok: true as const };
  });
