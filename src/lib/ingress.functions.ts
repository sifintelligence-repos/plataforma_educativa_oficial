import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { DIRECTORY } from "@/lib/academy.config";
import { COURSES } from "@/lib/catalog";
import { getSql } from "@/lib/db";

const CEO_CODE = "SIF-DIRECCION";
const ROLES = ["estudiante", "profesor", "ceo"] as const;
type Role = (typeof ROLES)[number];
const PAYMENT = ["impago", "en_revision", "verificado", "rechazado", "no_aplica"] as const;
type PaymentStatus = (typeof PAYMENT)[number];

export type IngressProfile = {
  gmail: string;
  name: string;
  role: Role;
  age: number;
  studyId: string | null;
  teaches: string | null;
  paymentStatus: PaymentStatus;
  paymentRef: string | null;
  hasDocument: boolean;
};

export type IngressPerson = IngressProfile & { userId: string };

export type AcademyClass = {
  id: number;
  courseId: string;
  title: string;
  body: string;
  authorGmail: string;
};

export type ExtraEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  place: string;
  detail: string;
  authorGmail: string;
};

export type IngressContact = {
  userId: string;
  gmail: string;
  name: string;
  role: Role;
};

export type DirectMessage = {
  id: number;
  fromUser: string;
  body: string;
};

export type IngressSnapshot = {
  profile: IngressProfile | null;
  classes: AcademyClass[];
  events: ExtraEvent[];
  contacts: IngressContact[];
  people: IngressPerson[];
};

type ProfileRow = {
  user_id: string;
  gmail: string;
  name: string | null;
  role: string;
  age: number;
  study_id: string | null;
  teaches: string | null;
  payment_status: string;
  payment_ref: string | null;
  has_document: boolean;
  password_salt?: string;
  password_hash?: string;
};

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function asRole(value: string): Role {
  if (value === "profesor" || value === "ceo" || value === "estudiante") return value;
  return "estudiante";
}

function asPayment(value: string): PaymentStatus {
  if (value === "en_revision" || value === "verificado" || value === "rechazado" || value === "no_aplica" || value === "impago") {
    return value;
  }
  return "impago";
}

function courseOk(id: string) {
  return COURSES.some((course) => course.id === id);
}

function slotFor(email: string) {
  const mail = email.trim().toLowerCase();
  if (DIRECTORY.ceoGmails.some((gmail) => gmail.trim().toLowerCase() === mail)) {
    return { role: "ceo" as const, studyId: null, teaches: null, payment: "no_aplica" as const };
  }
  const staff = DIRECTORY.staff.find((row) => row.gmail.trim().toLowerCase() === mail);
  if (staff && courseOk(staff.teaches)) {
    return { role: "profesor" as const, studyId: null, teaches: staff.teaches, payment: "no_aplica" as const };
  }
  return null;
}

async function applyDirectory(userId: string) {
  const row = await ownRow(userId);
  if (!row) return;
  const slot = slotFor(row.gmail);
  if (!slot) return;
  if (row.role === slot.role && row.study_id === slot.studyId && row.teaches === slot.teaches && row.payment_status === slot.payment) {
    return;
  }
  const sql = await getSql();
  await sql`
    update ingress_profiles
    set role = ${slot.role}, study_id = ${slot.studyId}, teaches = ${slot.teaches}, payment_status = ${slot.payment}
    where user_id = ${userId}
  `;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string) {
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

function mapProfile(row: ProfileRow): IngressProfile {
  return {
    gmail: row.gmail,
    name: row.name?.trim() || row.gmail,
    role: asRole(row.role),
    age: Number(row.age),
    studyId: row.study_id,
    teaches: row.teaches,
    paymentStatus: asPayment(row.payment_status),
    paymentRef: row.payment_ref,
    hasDocument: asBool(row.has_document),
  };
}

async function gmailFor(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string; name: string | null }>`
    select email, name from "user" where id = ${userId}
  `;
  const email = rows[0]?.email?.trim().toLowerCase() ?? "";
  if (!email.endsWith("@gmail.com")) throw new Error("La cuenta tiene que ser un Gmail");
  return { email, name: rows[0]?.name ?? "" };
}

async function ownRow(userId: string) {
  const sql = await getSql();
  const rows = await sql<ProfileRow>`
    select p.user_id, p.gmail, u.name, p.role, p.age, p.study_id, p.teaches, p.payment_status, p.payment_ref,
      (p.document_data is not null and p.document_data <> '') as has_document,
      p.password_salt, p.password_hash
    from ingress_profiles p
    left join "user" u on u.id = p.user_id
    where p.user_id = ${userId}
  `;
  return rows[0] ?? null;
}

function canPair(me: ProfileRow, other: ProfileRow) {
  if (me.role === "ceo" || other.role === "ceo") return true;
  if (me.role === "profesor" && other.role === "estudiante") return Boolean(me.teaches) && me.teaches === other.study_id;
  if (me.role === "estudiante" && other.role === "profesor") return Boolean(other.teaches) && other.teaches === me.study_id;
  return false;
}

export const getIngress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<IngressSnapshot> => {
    await applyDirectory(context.userId);
    const sql = await getSql();
    const mine = await ownRow(context.userId);
    if (!mine) return { profile: null, classes: [], events: [], contacts: [], people: [] };

    const classes = await sql<{ id: number; course_id: string; title: string; body: string; gmail: string }>`
      select c.id, c.course_id, c.title, c.body, p.gmail
      from academy_classes c
      join ingress_profiles p on p.user_id = c.author_id
      order by c.id desc
    `;
    const events = await sql<{
      id: number;
      title: string;
      event_date: string;
      event_time: string;
      place: string;
      detail: string;
      gmail: string;
    }>`
      select e.id, e.title, e.event_date, e.event_time, e.place, e.detail, p.gmail
      from academy_events e
      join ingress_profiles p on p.user_id = e.author_id
      order by e.event_date asc, e.id asc
    `;

    let contacts: ProfileRow[] = [];
    if (mine.role === "ceo") {
      contacts = await sql<ProfileRow>`
        select p.user_id, p.gmail, u.name, p.role, p.age, p.study_id, p.teaches, p.payment_status, p.payment_ref,
          (p.document_data is not null and p.document_data <> '') as has_document
        from ingress_profiles p
        left join "user" u on u.id = p.user_id
        where p.user_id <> ${context.userId}
        order by p.gmail asc
      `;
    } else if (mine.role === "profesor" && mine.teaches) {
      contacts = await sql<ProfileRow>`
        select p.user_id, p.gmail, u.name, p.role, p.age, p.study_id, p.teaches, p.payment_status, p.payment_ref,
          (p.document_data is not null and p.document_data <> '') as has_document
        from ingress_profiles p
        left join "user" u on u.id = p.user_id
        where p.role = 'estudiante' and p.study_id = ${mine.teaches}
        order by p.gmail asc
      `;
    } else if (mine.role === "estudiante" && mine.study_id) {
      contacts = await sql<ProfileRow>`
        select p.user_id, p.gmail, u.name, p.role, p.age, p.study_id, p.teaches, p.payment_status, p.payment_ref,
          false as has_document
        from ingress_profiles p
        left join "user" u on u.id = p.user_id
        where p.role = 'profesor' and p.teaches = ${mine.study_id}
        order by p.gmail asc
      `;
    }

    const people =
      mine.role === "ceo"
        ? await sql<ProfileRow>`
            select p.user_id, p.gmail, u.name, p.role, p.age, p.study_id, p.teaches, p.payment_status, p.payment_ref,
              (p.document_data is not null and p.document_data <> '') as has_document
            from ingress_profiles p
            left join "user" u on u.id = p.user_id
            order by p.created_at asc
          `
        : [];

    return {
      profile: mapProfile(mine),
      classes: classes.map((row) => ({
        id: Number(row.id),
        courseId: row.course_id,
        title: row.title,
        body: row.body,
        authorGmail: row.gmail,
      })),
      events: events.map((row) => ({
        id: Number(row.id),
        title: row.title,
        date: row.event_date,
        time: row.event_time,
        place: row.place,
        detail: row.detail,
        authorGmail: row.gmail,
      })),
      contacts: contacts.map((row) => ({
        userId: row.user_id,
        gmail: row.gmail,
        name: row.name?.trim() || row.gmail,
        role: asRole(row.role),
      })),
      people: people.map((row) => ({ userId: row.user_id, ...mapProfile(row) })),
    };
  });

export const confirmEntry = createServerFn({ method: "POST" })
  .validator((input: { code?: string }) => {
    const code = String(input?.code ?? "").trim();
    const dev = process.env.NODE_ENV !== "production";
    if (!dev && (code.length < 4 || code.length > 12 || !/^[a-zA-Z0-9]+$/.test(code))) {
      throw new Error("El código tiene de 4 a 12 letras o números");
    }
    return { code: code || "dev" };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const existing = await ownRow(context.userId);
    if (existing) {
      await applyDirectory(context.userId);
      return { ok: true as const };
    }
    const { email } = await gmailFor(context.userId);
    const slot = slotFor(email);
    const studyId = slot ? slot.studyId : DIRECTORY.defaultStudyId;
    const { salt, hash } = hashPassword(data.code);
    const sql = await getSql();
    await sql`
      insert into ingress_profiles (
        user_id, gmail, role, age, study_id, teaches, paid_claim, payment_ref, payment_status,
        document_name, document_data, password_salt, password_hash
      ) values (
        ${context.userId},
        ${email},
        ${slot?.role ?? "estudiante"},
        ${0},
        ${slot ? studyId : DIRECTORY.defaultStudyId},
        ${slot?.teaches ?? null},
        ${"no"},
        ${null},
        ${slot?.payment ?? "impago"},
        ${null},
        ${null},
        ${salt},
        ${hash}
      )
    `;
    return { ok: true as const };
  });

export const saveIngress = createServerFn({ method: "POST" })
  .validator((input: {
    role?: string;
    age?: number;
    studyId?: string;
    teaches?: string;
    paid?: boolean;
    paymentRef?: string;
    documentData?: string;
    documentName?: string;
    masterPassword?: string;
    ceoCode?: string;
  }) => {
    const role = String(input?.role ?? "");
    if (!ROLES.includes(role as Role)) throw new Error("Rol desconocido");
    const age = Number(input?.age);
    if (!Number.isInteger(age) || age < 10 || age > 99) throw new Error("Edad fuera de rango");
    const masterPassword = String(input?.masterPassword ?? "");
    if (masterPassword.length < 8 || masterPassword.length > 80) throw new Error("La contraseña maestra es corta");
    const studyId = String(input?.studyId ?? "");
    const teaches = String(input?.teaches ?? "");
    const paymentRef = String(input?.paymentRef ?? "").trim().slice(0, 80);
    const documentData = String(input?.documentData ?? "");
    const documentName = String(input?.documentName ?? "").slice(0, 120);
    if (documentData.length > 1_400_000) throw new Error("La foto es demasiado pesada");
    if (documentData && !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(documentData)) {
      throw new Error("La foto tiene que ser JPG, PNG o WebP");
    }
    return {
      role: role as Role,
      age,
      studyId,
      teaches,
      paid: Boolean(input?.paid),
      paymentRef,
      documentData,
      documentName,
      masterPassword,
      ceoCode: String(input?.ceoCode ?? ""),
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const existing = await ownRow(context.userId);
    if (existing) throw new Error("El ingreso ya está hecho");
    const { email } = await gmailFor(context.userId);
    if (data.role === "ceo" && data.ceoCode !== CEO_CODE) throw new Error("Clave de dirección incorrecta");
    if ((data.role === "estudiante" || data.role === "profesor") && !data.documentData) {
      throw new Error("Falta la foto del documento");
    }
    if (data.role === "estudiante" && !courseOk(data.studyId)) throw new Error("Elegí un programa");
    if (data.role === "profesor" && !courseOk(data.teaches)) throw new Error("Elegí la materia");
    if (data.role === "estudiante" && data.paid && data.paymentRef.length < 4) {
      throw new Error("Falta el número de comprobante");
    }
    const paymentStatus: PaymentStatus =
      data.role === "estudiante" ? (data.paid ? "en_revision" : "impago") : "no_aplica";
    const { salt, hash } = hashPassword(data.masterPassword);
    const sql = await getSql();
    await sql`
      insert into ingress_profiles (
        user_id, gmail, role, age, study_id, teaches, paid_claim, payment_ref, payment_status,
        document_name, document_data, password_salt, password_hash
      ) values (
        ${context.userId},
        ${email},
        ${data.role},
        ${data.age},
        ${data.role === "estudiante" ? data.studyId : null},
        ${data.role === "profesor" ? data.teaches : null},
        ${data.role === "estudiante" && data.paid ? "si" : "no"},
        ${data.role === "estudiante" && data.paid ? data.paymentRef : null},
        ${paymentStatus},
        ${data.documentName || null},
        ${data.documentData || null},
        ${salt},
        ${hash}
      )
    `;
    return { ok: true as const };
  });

export const checkMaster = createServerFn({ method: "POST" })
  .validator((input: { password?: string }) => {
    const password = String(input?.password ?? "");
    if (password.length < 8 || password.length > 80) throw new Error("Clave inválida");
    return { password };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const row = await ownRow(context.userId);
    if (!row?.password_salt || !row.password_hash) return { ok: false as const };
    return { ok: verifyPassword(data.password, row.password_salt, row.password_hash) };
  });

export const declarePayment = createServerFn({ method: "POST" })
  .validator((input: { paymentRef?: string }) => {
    const paymentRef = String(input?.paymentRef ?? "").trim().slice(0, 80);
    if (paymentRef.length < 4) throw new Error("Falta el comprobante");
    return { paymentRef };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const row = await ownRow(context.userId);
    if (!row || row.role !== "estudiante") throw new Error("No corresponde");
    if (row.payment_status === "verificado") return { ok: true as const };
    const sql = await getSql();
    await sql`
      update ingress_profiles
      set paid_claim = 'si', payment_ref = ${data.paymentRef}, payment_status = 'en_revision'
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const adminUpdatePerson = createServerFn({ method: "POST" })
  .validator((input: { userId?: string; role?: string; courseId?: string }) => {
    const userId = String(input?.userId ?? "");
    const role = String(input?.role ?? "");
    const courseId = String(input?.courseId ?? "");
    if (!userId || !ROLES.includes(role as Role)) throw new Error("Cambio inválido");
    if ((role === "estudiante" || role === "profesor") && !courseOk(courseId)) throw new Error("Elegí un programa");
    return { userId, role: role as Role, courseId };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await ownRow(context.userId);
    if (mine?.role !== "ceo") throw new Error("Solo dirección");
    if (data.userId === context.userId) throw new Error("Tu cuenta de CEO no se cambia desde acá");
    const target = await ownRow(data.userId);
    if (!target) throw new Error("Esa persona no está en la academia");
    if (slotFor(target.gmail)) throw new Error("Esa cuenta la fija el archivo de configuración");
    const studyId = data.role === "estudiante" ? data.courseId : null;
    const teaches = data.role === "profesor" ? data.courseId : null;
    const payment = data.role === "estudiante" ? (target.payment_status === "no_aplica" ? "impago" : target.payment_status) : "no_aplica";
    const sql = await getSql();
    await sql`
      update ingress_profiles
      set role = ${data.role}, study_id = ${studyId}, teaches = ${teaches}, payment_status = ${payment}
      where user_id = ${data.userId}
    `;
    return { ok: true as const };
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .validator((input: { userId?: string; status?: string }) => {
    const userId = String(input?.userId ?? "");
    const status = String(input?.status ?? "");
    if (!userId || (status !== "verificado" && status !== "rechazado")) throw new Error("Revisión inválida");
    return { userId, status: status as "verificado" | "rechazado" };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await ownRow(context.userId);
    if (mine?.role !== "ceo") throw new Error("Solo dirección");
    const sql = await getSql();
    await sql`
      update ingress_profiles
      set payment_status = ${data.status}
      where user_id = ${data.userId} and role = 'estudiante'
    `;
    return { ok: true as const };
  });

export const readDocument = createServerFn({ method: "POST" })
  .validator((input: { userId?: string }) => {
    const userId = String(input?.userId ?? "");
    if (!userId) throw new Error("Falta la persona");
    return { userId };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await ownRow(context.userId);
    if (mine?.role !== "ceo") throw new Error("Solo dirección");
    const sql = await getSql();
    const rows = await sql<{ document_name: string | null; document_data: string | null }>`
      select document_name, document_data from ingress_profiles where user_id = ${data.userId}
    `;
    const dataUrl = rows[0]?.document_data ?? "";
    if (!dataUrl.startsWith("data:image/")) return { name: "", dataUrl: "" };
    return { name: rows[0]?.document_name ?? "documento", dataUrl };
  });

export const addClass = createServerFn({ method: "POST" })
  .validator((input: { courseId?: string; title?: string; body?: string }) => {
    const courseId = String(input?.courseId ?? "");
    const title = String(input?.title ?? "").trim().slice(0, 120);
    const body = String(input?.body ?? "").trim().slice(0, 2000);
    if (!courseOk(courseId) || title.length < 3 || body.length < 3) throw new Error("Clase incompleta");
    return { courseId, title, body };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await ownRow(context.userId);
    if (!mine || (mine.role !== "profesor" && mine.role !== "ceo")) throw new Error("Sin permiso");
    if (mine.role === "profesor" && mine.teaches !== data.courseId) throw new Error("Esa materia no es tuya");
    const sql = await getSql();
    await sql`
      insert into academy_classes (author_id, course_id, title, body)
      values (${context.userId}, ${data.courseId}, ${data.title}, ${data.body})
    `;
    return { ok: true as const };
  });

export const addAcademyEvent = createServerFn({ method: "POST" })
  .validator((input: { title?: string; date?: string; time?: string; place?: string; detail?: string }) => {
    const title = String(input?.title ?? "").trim().slice(0, 120);
    const date = String(input?.date ?? "");
    const time = String(input?.time ?? "").trim().slice(0, 8);
    const place = String(input?.place ?? "").trim().slice(0, 80);
    const detail = String(input?.detail ?? "").trim().slice(0, 400);
    if (title.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || time.length < 4 || place.length < 2) {
      throw new Error("Evento incompleto");
    }
    return { title, date, time, place, detail };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await ownRow(context.userId);
    if (!mine || (mine.role !== "profesor" && mine.role !== "ceo")) throw new Error("Sin permiso");
    const sql = await getSql();
    await sql`
      insert into academy_events (author_id, title, event_date, event_time, place, detail)
      values (${context.userId}, ${data.title}, ${data.date}, ${data.time}, ${data.place}, ${data.detail})
    `;
    return { ok: true as const };
  });

export const loadThread = createServerFn({ method: "POST" })
  .validator((input: { userId?: string }) => {
    const userId = String(input?.userId ?? "");
    if (!userId) throw new Error("Falta la persona");
    return { userId };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<DirectMessage[]> => {
    const mine = await ownRow(context.userId);
    const other = await ownRow(data.userId);
    if (!mine || !other || !canPair(mine, other)) throw new Error("Sin permiso");
    const sql = await getSql();
    const rows = await sql<{ id: number; from_user: string; body: string }>`
      select id, from_user, body from direct_messages
      where (from_user = ${context.userId} and to_user = ${data.userId})
         or (from_user = ${data.userId} and to_user = ${context.userId})
      order by id asc
    `;
    return rows.map((row) => ({ id: Number(row.id), fromUser: row.from_user, body: row.body }));
  });

export const sendDirect = createServerFn({ method: "POST" })
  .validator((input: { userId?: string; body?: string }) => {
    const userId = String(input?.userId ?? "");
    const body = String(input?.body ?? "").trim().slice(0, 800);
    if (!userId || body.length < 1) throw new Error("Mensaje vacío");
    return { userId, body };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await ownRow(context.userId);
    const other = await ownRow(data.userId);
    if (!mine || !other || !canPair(mine, other)) throw new Error("Sin permiso");
    const sql = await getSql();
    await sql`
      insert into direct_messages (from_user, to_user, body)
      values (${context.userId}, ${data.userId}, ${data.body})
    `;
    return { ok: true as const };
  });
