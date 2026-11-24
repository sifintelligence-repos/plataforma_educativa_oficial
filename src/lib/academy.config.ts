/**
 * Datos que configuran los desarrolladores.
 * Programas, precios y materiales viven en src/lib/catalog.ts.
 * Acá va quién dirige, quién enseña y las cifras del canal.
 * Un Gmail de esta lista entra como CEO con admin total.
 */
export const DIRECTORY = {
  ceoGmails: ["direccion.sif@gmail.com"],
  staff: [
    // { gmail: "profesor@gmail.com", teaches: "python" },
  ] as { gmail: string; teaches: string }[],
  defaultStudyId: "python",
};

/** Cifras internas del canal. Dejá "—" hasta tener el número real. */
export const CHANNEL_FIGURES = {
  subscribers: "—",
  views28: "—",
  hours: "—",
  retention: "—",
  series: [] as { week: string; views: number }[],
  videos: [
    { title: "Qué es la Academia SIF", views: "—", when: "a publicar" },
    { title: "Cómo se escribe un informe competitivo", views: "—", when: "inteligencia" },
    { title: "De cero a una app en Python", views: "—", when: "programación" },
    { title: "El kernel, contado sin humo", views: "—", when: "sistemas" },
  ],
};
