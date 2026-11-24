import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHANNEL } from "@/lib/catalog";

export const Route = createFileRoute("/_app/canal")({ component: ChannelPage });

function ChannelPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="rise">
      <p className="kicker">{CHANNEL.name}</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Cómo se ve el canal</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Videos y novedades de la firma. Este tablero es el seguimiento interno del campus, no las cifras públicas de YouTube.
      </p>
      <a className="mt-3 inline-block text-sm text-brass underline-offset-4 hover:underline" href={CHANNEL.youtube} target="_blank" rel="noreferrer">
        {CHANNEL.handle}
      </a>
      <section className="glass mt-6 grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        <Figure value={CHANNEL.subscribers} label="suscriptores" />
        <Figure value={CHANNEL.views28} label="vistas, 28 días" />
        <Figure value={CHANNEL.hours} label="horas vistas" />
        <Figure value={CHANNEL.retention} label="retención media" />
      </section>
      <section className="glass mt-4 p-5">
        <p className="kicker">Vistas por semana</p>
        {CHANNEL.series.length > 1 ? (
          <>
            <p className="text-xs text-muted">En miles</p>
            <div className="mt-3 h-56">
              {ready ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHANNEL.series}>
                    <XAxis dataKey="week" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) => [`${value} mil`, "Vistas"]}
                      contentStyle={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid var(--color-line)",
                        borderRadius: 12,
                        color: "var(--color-ink)",
                      }}
                    />
                    <Area type="monotone" dataKey="views" stroke="var(--color-ink)" fill="var(--color-mist)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">Todavía no hay cifras. Se cargan en la configuración de los desarrolladores.</p>
        )}
      </section>
      <section className="mt-4">
        <h2 className="font-serif text-3xl">Piezas recientes</h2>
        <ol className="mt-3 grid gap-2">
          {CHANNEL.videos.map((video, index) => (
            <li key={video.title} className="glass flex items-center gap-4 p-4">
              <span className="font-serif text-2xl text-brass tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{video.title}</span>
                <span className="text-xs text-muted">{video.when}</span>
              </span>
              <span className="text-sm tabular-nums">{video.views}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-5">
      <p className="font-serif text-3xl tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
