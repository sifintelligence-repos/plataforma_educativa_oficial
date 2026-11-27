import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Compass,
  FolderOpen,
  LayoutGrid,
  MessagesSquare,
  MoreHorizontal,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { FIRM, MATERIALS, courseById } from "@/lib/catalog";
import { useCampus } from "@/components/campus";
import { useIngress } from "@/components/ingress";

const NAV = [
  { to: "/", label: "Inicio", icon: Compass, exact: true },
  { to: "/cursos", label: "Estudios", icon: BookOpen, exact: false },
  { to: "/perfil", label: "Perfil", icon: UserRound, exact: true },
  { to: "/apps", label: "Apps", icon: LayoutGrid, exact: false },
  { to: "/materiales", label: "Materiales", icon: FolderOpen, exact: true },
  { to: "/aula", label: "Aula", icon: MessagesSquare, exact: true },
  { to: "/eventos", label: "Agenda", icon: CalendarDays, exact: true },
  { to: "/canal", label: "Canal", icon: BarChart3, exact: true },
] as const;

const MOBILE = [
  { to: "/", label: "Inicio", icon: Compass, exact: true },
  { to: "/cursos", label: "Estudios", icon: BookOpen, exact: false },
  { to: "/apps", label: "Apps", icon: LayoutGrid, exact: false },
  { to: "/aula", label: "Aula", icon: MessagesSquare, exact: true },
] as const;

const MORE = [
  { to: "/perfil", label: "Perfil", icon: UserRound },
  { to: "/materiales", label: "Materiales", icon: FolderOpen },
  { to: "/eventos", label: "Agenda", icon: CalendarDays },
  { to: "/canal", label: "Canal", icon: BarChart3 },
] as const;

function Mark() {
  return (
    <span className="grid size-9 place-items-center rounded-xl bg-ink text-brass" aria-hidden="true">
      <svg viewBox="0 0 32 32" className="size-6">
        <path d="M16 5.5 L19.2 16 L16 14.2 L12.8 16 Z" className="fill-brass" />
        <path d="M16 26.5 L12.8 16 L16 17.8 L19.2 16 Z" className="fill-on-ink" />
        <circle cx="16" cy="16" r="1.35" className="fill-brass" />
      </svg>
    </span>
  );
}

export function BootScreen() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="glass w-full max-w-sm px-6 py-8 text-center">
        <div className="mx-auto mb-4 w-fit">
          <Mark />
        </div>
        <p className="kicker">Campus</p>
        <h1 className="mt-2 font-serif text-3xl text-ink">{FIRM}</h1>
        <p className="mt-2 text-sm text-muted">Abriendo tu mesa de estudio…</p>
      </div>
    </main>
  );
}

function active(pathname: string, to: string, exact: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { snapshot } = useCampus();
  const { snapshot: ingress } = useIngress();
  const user = useCurrentUser();
  const role = ingress?.profile?.role;
  const study = courseById(ingress?.profile?.studyId ?? ingress?.profile?.teaches ?? "");
  const roleLine = role === "ceo" ? "CEO · admin total" : role === "profesor" ? `Profesor · ${study?.title ?? "materia"}` : `Estudiante · ${study?.title ?? "programa"}`;
  const [more, setMore] = useState(false);
  const focusId = role === "profesor" ? ingress?.profile?.teaches : ingress?.profile?.studyId;
  const folder = role === "ceo" ? MATERIALS : MATERIALS.filter((item) => item.courseId === focusId);
  const states = new Map(snapshot?.materials.map((row) => [row.materialId, row.state]) ?? []);
  const missing = folder.filter((item) => (states.get(item.id) ?? "missing") === "missing").length;
  const moreOn = MORE.some((item) => active(pathname, item.to, true));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      <aside className="dock-aside glass sticky top-4 my-4 ml-3 hidden w-60 shrink-0 flex-col p-3 md:flex">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <Mark />
          <span>
            <span className="block text-sm font-medium tracking-wide">SIF</span>
            <span className="mono block text-[10px] tracking-[0.14em] text-muted uppercase">Campus</span>
          </span>
        </Link>
        <nav className="mt-4 flex flex-1 flex-col gap-1" aria-label="Secciones">
          {NAV.map((item) => {
            const on = active(pathname, item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={on ? "page" : undefined}
                className={on ? "nav-link is-on" : "nav-link"}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {item.to === "/materiales" && missing > 0 ? (
                  <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-on-ink tabular-nums">{missing}</span>
                ) : null}
              </Link>
            );
          })}
          {role === "profesor" || role === "ceo" ? (
            <Link to="/clases" className={active(pathname, "/clases", true) ? "nav-link is-on" : "nav-link"}>
              <BookOpen className="size-4" strokeWidth={1.75} />
              Clases
            </Link>
          ) : null}
          {role === "ceo" ? (
            <Link to="/direccion" className={active(pathname, "/direccion", true) ? "nav-link is-on" : "nav-link"}>
              <Shield className="size-4" strokeWidth={1.75} />
              Dirección
            </Link>
          ) : null}
        </nav>
        <div className="mt-3 border-t border-line px-2 pt-3">
          <UserButton />
          <p className="mt-2 text-xs text-muted">{roleLine}</p>
          <p className="truncate text-xs text-muted">{user?.primaryEmail}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-28 pt-4 md:px-6 md:pb-10 md:pt-6">
        <header className="glass mb-4 flex items-center gap-3 px-3 py-2 md:hidden">
          <Mark />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Strategic Intelligence</p>
            <p className="text-xs text-muted">{roleLine}</p>
          </div>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      <nav className="dock glass fixed inset-x-3 bottom-3 z-20 flex items-stretch justify-between px-1 py-1 md:hidden" aria-label="Secciones">
        {MOBILE.map((item) => {
          const on = active(pathname, item.to, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={on ? "page" : undefined}
              className={on ? "nav-link is-on flex-1 flex-col gap-0.5 px-1 text-xs" : "nav-link flex-1 flex-col gap-0.5 px-1 text-xs"}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          className={moreOn || more ? "nav-link is-on flex-1 flex-col gap-0.5 px-1 text-xs" : "nav-link flex-1 flex-col gap-0.5 px-1 text-xs"}
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
          Más
        </button>
      </nav>

      {more ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button type="button" className="scrim absolute inset-0" aria-label="Cerrar" onClick={() => setMore(false)} />
          <div className="glass absolute inset-x-3 bottom-24 p-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="kicker">Más del campus</p>
              <button type="button" className="grid size-10 place-items-center" onClick={() => setMore(false)} aria-label="Cerrar menú">
                <X className="size-4" />
              </button>
            </div>
            {MORE.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-link"
                  onClick={() => setMore(false)}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                  {item.to === "/materiales" && missing > 0 ? (
                    <span className="ml-auto text-xs tabular-nums text-brass">{missing} faltan</span>
                  ) : null}
                </Link>
              );
            })}
            {role === "profesor" || role === "ceo" ? (
              <Link to="/clases" className="nav-link" onClick={() => setMore(false)}>
                <BookOpen className="size-4" strokeWidth={1.75} />
                Clases
              </Link>
            ) : null}
            {role === "ceo" ? (
              <Link to="/direccion" className="nav-link" onClick={() => setMore(false)}>
                <Shield className="size-4" strokeWidth={1.75} />
                Dirección
              </Link>
            ) : null}
            <div className="mt-2 border-t border-line px-2 pt-3">
              <UserButton />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

