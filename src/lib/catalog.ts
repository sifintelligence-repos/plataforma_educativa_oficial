import { CHANNEL_FIGURES } from "@/lib/academy.config";

export type MaterialState = "missing" | "review" | "ok";

export type Professor = {
  id: string;
  name: string;
  role: string;
  focus: string;
};

export type Course = {
  id: string;
  index: string;
  title: string;
  summary: string;
  professorId: string;
  hours: string;
  level: string;
  track: string;
  price: string;
  status: "abierta" | "pronto";
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  minutes: number;
};

export type Material = {
  id: string;
  courseId: string;
  title: string;
  kind: "Lectura" | "Plantilla" | "Caso";
  defaultState: MaterialState;
};

export type AcademyEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  detail: string;
};

export type AcademyApp = {
  id: string;
  title: string;
  promise: string;
};

export const FIRM = "Strategic Intelligence Firm";
export const COHORT = "Academia SIF";
export const TAGLINE = "Tecnología e inteligencia que mueven negocios.";

export const PROFESSORS: Professor[] = [
  {
    id: "exequiel",
    name: "Exequiel",
    role: "Desarrollador Full Stack",
    focus: "Python, web, datos y sistemas",
  },
  {
    id: "dante",
    name: "Dante",
    role: "COO · Inteligencia",
    focus: "Informes, OSINT y operación",
  },
  {
    id: "alan",
    name: "Alan",
    role: "CMO · Marketing y Academia",
    focus: "Marca, campañas y catálogo",
  },
  {
    id: "gabi",
    name: "Gabi",
    role: "Closer de ventas",
    focus: "Prospección y cierre consultivo",
  },
];

const courseSeed: Array<Omit<Course, "index"> & { lessons: string[] }> = [
  {
    id: "python",
    title: "Desarrollador en Python",
    summary: "De cero a una aplicación completa: lenguaje, objetos, APIs y un proyecto final.",
    professorId: "exequiel",
    hours: "12 semanas",
    level: "Principiante a avanzado",
    track: "Programación",
    price: "$90.000–$150.000",
    status: "abierta",
    lessons: ["El lenguaje y la terminal", "Datos, funciones y objetos", "APIs que responden", "Proyecto final y despliegue"],
  },
  {
    id: "python-pro",
    title: "Programador en Python",
    summary: "Para quien ya programa: tipado, testing, automatización y scripts de sistema.",
    professorId: "exequiel",
    hours: "10 semanas",
    level: "Intermedio",
    track: "Programación",
    price: "$100.000–$170.000",
    status: "abierta",
    lessons: ["Tipado que se sostiene", "Tests que atrapan regresiones", "Scripts de sistema", "Buenas prácticas del equipo"],
  },
  {
    id: "html",
    title: "HTML + CSS",
    summary: "Estructura semántica, Flexbox, Grid, responsive y una primera página publicada.",
    professorId: "exequiel",
    hours: "4 semanas",
    level: "Principiante",
    track: "Desarrollo Web",
    price: "$35.000–$65.000",
    status: "abierta",
    lessons: ["Documento semántico", "Caja, flex y grid", "Responsive de verdad", "Publicar la página"],
  },
  {
    id: "web",
    title: "Desarrollador Web",
    summary: "JavaScript, React, APIs, autenticación y un producto desplegado.",
    professorId: "exequiel",
    hours: "10 semanas",
    level: "Intermedio",
    track: "Desarrollo Web",
    price: "$100.000–$180.000",
    status: "abierta",
    lessons: ["JavaScript moderno", "React para interfaces", "Consumir una API", "Auth y despliegue"],
  },
  {
    id: "react",
    title: "JavaScript y React",
    summary: "El ecosistema interno de SIF: JavaScript en profundidad y React mantenible.",
    professorId: "exequiel",
    hours: "8 semanas",
    level: "Intermedio",
    track: "Desarrollo Web",
    price: "$80.000–$140.000",
    status: "abierta",
    lessons: ["El lenguaje sin magia", "Estado y composición", "Datos y efectos", "Una interfaz que se puede mantener"],
  },
  {
    id: "kernel",
    title: "Kernel de Sistema Operativo",
    summary: "El curso insignia: arquitectura, C y Rust, memoria, procesos y un mini-kernel.",
    professorId: "exequiel",
    hours: "16 semanas",
    level: "Avanzado",
    track: "Inteligencia y Sistemas",
    price: "$180.000–$300.000",
    status: "abierta",
    lessons: ["Qué hace un kernel", "Memoria y procesos", "C y Rust en el mismo proyecto", "Un mini-kernel que arranca"],
  },
  {
    id: "osint",
    title: "Ciberseguridad y OSINT",
    summary: "Reconocimiento ético, análisis de exposición e investigación con fuentes públicas.",
    professorId: "dante",
    hours: "8 semanas",
    level: "Intermedio",
    track: "Inteligencia y Sistemas",
    price: "$100.000–$180.000",
    status: "abierta",
    lessons: ["Qué es información pública", "Reconocimiento con límites", "Cómo se documenta un hallazgo", "Qué no se hace"],
  },
  {
    id: "informes",
    title: "Inteligencia Estratégica e Informes",
    summary: "Cómo SIF arma informes competitivos y financieros: mercado, competidores y redacción ejecutiva.",
    professorId: "dante",
    hours: "6 semanas",
    level: "Intermedio",
    track: "Inteligencia y Sistemas",
    price: "$65.000–$120.000",
    status: "abierta",
    lessons: ["La pregunta del informe", "Mercado y competidores", "Una página para dirección", "El límite de lo que se afirma"],
  },
  {
    id: "sql",
    title: "Bases de Datos SQL",
    summary: "Modelado y consulta: esquemas, relaciones, índices y consultas de trabajo.",
    professorId: "exequiel",
    hours: "6 semanas",
    level: "Principiante a intermedio",
    track: "Programación",
    price: "$55.000–$100.000",
    status: "abierta",
    lessons: ["Tablas y relaciones", "Consultas que responden", "Índices sin misterio", "Un esquema de negocio"],
  },
  {
    id: "datos",
    title: "Análisis de Datos con Python",
    summary: "Limpieza, análisis, visualización y tableros para decidir con evidencia.",
    professorId: "exequiel",
    hours: "8 semanas",
    level: "Intermedio",
    track: "Programación",
    price: "$80.000–$140.000",
    status: "abierta",
    lessons: ["Datos sucios", "Preguntas que se pueden medir", "Un gráfico que se lee", "Tablero para el equipo"],
  },
  {
    id: "agentes",
    title: "Agentes de IA",
    summary: "De prompts a agentes que usan herramientas, leen documentos y cierran una tarea.",
    professorId: "alan",
    hours: "8 semanas",
    level: "Intermedio",
    track: "IA y Automatización",
    price: "$100.000–$180.000",
    status: "abierta",
    lessons: ["Un prompt con oficio", "Herramientas y límites", "Leer documentos", "Una tarea que termina sola"],
  },
  {
    id: "agencia",
    title: "Agencia de IA",
    summary: "Qué servicios vender, cómo conseguir clientes, armar paquetes y entregar con calidad.",
    professorId: "alan",
    hours: "8 semanas",
    level: "Todos los niveles",
    track: "IA y Automatización",
    price: "$80.000–$150.000",
    status: "abierta",
    lessons: ["Qué se puede vender", "Paquetes con alcance", "Conseguir el primer cliente", "Entregar sin prometer de más"],
  },
  {
    id: "auto",
    title: "Automatización de Procesos con IA",
    summary: "Tareas repetitivas, correos, reportes y flujos combinando IA con automatización.",
    professorId: "alan",
    hours: "6 semanas",
    level: "Principiante a intermedio",
    track: "IA y Automatización",
    price: "$70.000–$130.000",
    status: "abierta",
    lessons: ["Qué vale automatizar", "Un flujo corto", "Correos y reportes", "Cuando conviene parar"],
  },
  {
    id: "proto",
    title: "Ingeniería de Prototipos",
    summary: "Del dibujo al prototipo: diseño, impresión 3D, electrónica básica y microcontroladores.",
    professorId: "exequiel",
    hours: "10 semanas",
    level: "Principiante a intermedio",
    track: "Ingeniería",
    price: "$100.000–$180.000",
    status: "abierta",
    lessons: ["Del dibujo al alcance", "Impresión 3D", "Electrónica básica", "Un prototipo que se muestra"],
  },
  {
    id: "ventas",
    title: "Curso de Ventas",
    summary: "Prospección, llamadas, objeciones y cierre consultivo, con práctica en vivo.",
    professorId: "gabi",
    hours: "6 semanas",
    level: "Todos los niveles",
    track: "Ventas y Negocios",
    price: "$50.000–$90.000",
    status: "abierta",
    lessons: ["A quién se llama", "El primer minuto", "Objeciones reales", "Cierre consultivo"],
  },
  {
    id: "ecom",
    title: "Ecommerce y Tiendas Online",
    summary: "Catálogo, pagos, envíos, fotos de producto y marketing de una tienda.",
    professorId: "alan",
    hours: "6 semanas",
    level: "Principiante a intermedio",
    track: "Ventas y Negocios",
    price: "$55.000–$100.000",
    status: "abierta",
    lessons: ["Catálogo que se entiende", "Pagos y envíos", "Fotos y fichas", "Tráfico con medida"],
  },
  {
    id: "marketing",
    title: "Marketing Digital",
    summary: "Redes, contenido, anuncios pagos y analítica, dictado por el equipo de marketing.",
    professorId: "alan",
    hours: "6 semanas",
    level: "Principiante",
    track: "Ventas y Negocios",
    price: "$55.000–$100.000",
    status: "abierta",
    lessons: ["A quién le habla la marca", "Contenido de una semana", "Anuncios con límite", "Qué mirar en la analítica"],
  },
  {
    id: "rust",
    title: "Programación con Rust",
    summary: "Curso previsto. Programa, duración y fechas pendientes de confirmación.",
    professorId: "exequiel",
    hours: "Duración a definir",
    level: "Por definir",
    track: "Programación",
    price: "A confirmar",
    status: "pronto",
    lessons: ["Por qué Rust en SIF", "Programa en preparación", "Fechas por confirmar"],
  },
];

export const COURSES: Course[] = courseSeed.map((course, index) => ({
  id: course.id,
  index: String(index + 1).padStart(2, "0"),
  title: course.title,
  summary: course.summary,
  professorId: course.professorId,
  hours: course.hours,
  level: course.level,
  track: course.track,
  price: course.price,
  status: course.status,
}));

export const LESSONS: Lesson[] = courseSeed.flatMap((course) =>
  course.lessons.map((title, index) => ({
    id: `${course.id}-${index + 1}`,
    courseId: course.id,
    title,
    minutes: 18 + index * 4,
  })),
);

export const MATERIALS: Material[] = [
  { id: "m1", courseId: "python", title: "Guía de la primera aplicación", kind: "Lectura", defaultState: "missing" },
  { id: "m2", courseId: "python", title: "Repo del proyecto final", kind: "Caso", defaultState: "missing" },
  { id: "m3", courseId: "html", title: "Plantilla de página publicada", kind: "Plantilla", defaultState: "missing" },
  { id: "m4", courseId: "informes", title: "Caso de informe competitivo", kind: "Caso", defaultState: "missing" },
  { id: "m5", courseId: "osint", title: "Ficha de fuente pública", kind: "Plantilla", defaultState: "missing" },
  { id: "m6", courseId: "react", title: "Lectura del stack interno", kind: "Lectura", defaultState: "missing" },
  { id: "m7", courseId: "sql", title: "Esquema de práctica", kind: "Plantilla", defaultState: "missing" },
  { id: "m8", courseId: "ventas", title: "Guion de llamada de un minuto", kind: "Plantilla", defaultState: "missing" },
  { id: "m9", courseId: "kernel", title: "Mapa del mini-kernel", kind: "Lectura", defaultState: "missing" },
  { id: "m10", courseId: "marketing", title: "Calendario de una semana", kind: "Plantilla", defaultState: "missing" },
  { id: "m11", courseId: "agentes", title: "Brief de un agente acotado", kind: "Caso", defaultState: "missing" },
  { id: "m12", courseId: "ecom", title: "Checklist de tienda", kind: "Plantilla", defaultState: "missing" },
];

export const EVENTS: AcademyEvent[] = [
  {
    id: "e1",
    title: "Preinscripción abierta · Academia SIF",
    date: "2026-11-18",
    time: "18:00",
    place: "En línea",
    detail: "Alan presenta los 18 programas, precios orientativos y cómo queda el diploma de la firma.",
  },
  {
    id: "e2",
    title: "Clínica de informes",
    date: "2026-11-25",
    time: "16:00",
    place: "Sala de inteligencia",
    detail: "Dante revisa borradores de informe competitivo. Traé una página, aunque esté a medias.",
  },
  {
    id: "e3",
    title: "Entrega de proyectos Python",
    date: "2026-12-09",
    time: "19:00",
    place: "Aula de tecnología",
    detail: "Exequiel mira los proyectos finales: que corra, que esté desplegado y que otro lo pueda leer.",
  },
  {
    id: "e4",
    title: "Ventana de postulaciones",
    date: "2027-04-01",
    time: "09:00",
    place: "Carreras SIF",
    detail: "La firma recibe postulaciones en abril y octubre. La próxima ventana abre en abril.",
  },
];

export const APPS: AcademyApp[] = [
  { id: "briefing", title: "Informe ejecutivo", promise: "Una página con pregunta, juicio, evidencia y límite." },
  { id: "atlas", title: "Matriz de decisión", promise: "Dos ejes para ordenar una alternativa de negocio." },
  { id: "fuentes", title: "Cuaderno OSINT", promise: "Fichas de fuentes públicas, con grado de confianza." },
  { id: "indicadores", title: "Tablero de métricas", promise: "Lo que el equipo mira cada semana." },
];

export const SEED_DONE = [
  "python-1",
  "python-2",
  "html-1",
  "html-2",
  "html-3",
  "html-4",
  "informes-1",
  "react-1",
];

export const SEED_MESSAGES: { professorId: string; sender: "student" | "professor"; body: string }[] = [
  {
    professorId: "exequiel",
    sender: "professor",
    body: "Vi el proyecto de Python. La API responde. Falta el despliegue y un README que otro del equipo pueda seguir.",
  },
  {
    professorId: "exequiel",
    sender: "student",
    body: "Lo dejo publicado esta semana. ¿Lo revisamos antes de la entrega del 9 de diciembre?",
  },
  {
    professorId: "dante",
    sender: "professor",
    body: "El informe competitivo todavía no tiene contraste. Una fuente sola no cierra. Traé la ficha a la clínica del 25.",
  },
];

export type BriefingNote = {
  question: string;
  judgment: string;
  evidence: string;
  caveat: string;
  audience: string;
};

export type AtlasNote = {
  x: string;
  y: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
};

export type SourceItem = { id: string; name: string; grade: string; note: string };
export type FuentesNote = { items: SourceItem[] };

export type IndicatorItem = { id: string; name: string; status: "ok" | "watch" | "alert"; note: string };
export type IndicadoresNote = { items: IndicatorItem[] };

export const DEFAULT_BRIEFING: BriefingNote = {
  question: "¿Conviene abrir la preinscripción de Inteligencia Estratégica antes de cerrar la entrega de Python?",
  judgment: "Sí, si el objetivo es que los informes de diciembre citen más de una fuente.",
  evidence: "La ficha de fuente y el caso de informe competitivo siguen fuera de carpeta. La clínica es el 25 de noviembre.",
  caveat: "No confirma cupo ni el precio final. El catálogo marca un rango de $65.000 a $120.000 por alumno.",
  audience: "Alan · Academia y Dante · Inteligencia",
};

export const DEFAULT_ATLAS: AtlasNote = {
  x: "Poco alcance  →  alcance cerrado",
  y: "Poco presupuesto  →  presupuesto holgado",
  q1: "Landing de presencia inicial",
  q2: "Sitio institucional con varias secciones",
  q3: "Postergar y diagnosticar",
  q4: "Prometer un sistema sin alcance",
};

export const DEFAULT_FUENTES: FuentesNote = {
  items: [
    { id: "s1", name: "Sitio público de la firma", grade: "A", note: "Fuente propia. Citable." },
    { id: "s2", name: "Catálogo de pricing, octubre 2026", grade: "B", note: "Valores orientativos, no cierre." },
    { id: "s3", name: "Comentario sin autor", grade: "F", note: "No entra al informe." },
  ],
};

export const DEFAULT_INDICADORES: IndicadoresNote = {
  items: [
    { id: "i1", name: "Programas con preinscripción abierta", status: "ok", note: "17 abiertos. Rust sigue en preparación." },
    { id: "i2", name: "Materiales fuera de carpeta", status: "watch", note: "Informe, OSINT, React, kernel y agentes." },
    { id: "i3", name: "Proyecto Python desplegado", status: "alert", note: "La API responde. Falta publicarlo." },
    { id: "i4", name: "Puestos cubiertos", status: "watch", note: "7 de 34. Próxima ventana: abril." },
  ],
};

export const CHANNEL = {
  name: "Canal SIF",
  handle: "@StrategicIntelligenceFiirm",
  youtube: "https://www.youtube.com/@StrategicIntelligenceFiirm",
  subscribers: CHANNEL_FIGURES.subscribers,
  views28: CHANNEL_FIGURES.views28,
  hours: CHANNEL_FIGURES.hours,
  retention: CHANNEL_FIGURES.retention,
  series: CHANNEL_FIGURES.series,
  videos: CHANNEL_FIGURES.videos,
};

export function professorById(id: string) {
  return PROFESSORS.find((p) => p.id === id);
}

export function courseById(id: string) {
  return COURSES.find((c) => c.id === id);
}

export function lessonsFor(courseId: string) {
  return LESSONS.filter((l) => l.courseId === courseId);
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatDay(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return { day: String(d).padStart(2, "0"), month: MONTHS[(m ?? 1) - 1] ?? "" };
}

export function daysUntil(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function stateLabel(state: MaterialState) {
  if (state === "ok") return "En tu carpeta";
  if (state === "review") return "En revisión";
  return "Falta";
}

export function nextMaterialState(state: MaterialState): MaterialState {
  if (state === "missing") return "review";
  if (state === "review") return "ok";
  return "missing";
}

export function materialAction(state: MaterialState) {
  if (state === "missing") return "Pasar a revisión";
  if (state === "review") return "Ya está en mi carpeta";
  return "Marcar que falta";
}
