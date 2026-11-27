export function Ring({ value, caption }: { value: number; caption: string }) {
  const safe = Math.max(0, Math.min(100, value));
  const radius = 42;
  const length = 2 * Math.PI * radius;
  const offset = length - (safe / 100) * length;
  return (
    <div className="relative grid size-[7.5rem] shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="size-[7.5rem] -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e39a3c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={offset}
          className="ring-draw"
        />
      </svg>
      <div className="absolute text-center">
        <p className="mono text-xl leading-none tabular-nums">{safe}</p>
        <p className="mono mt-1 text-[9px] tracking-[0.16em] text-muted uppercase">{caption}</p>
      </div>
    </div>
  );
}
