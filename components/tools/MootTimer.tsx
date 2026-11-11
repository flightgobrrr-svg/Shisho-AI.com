"use client";

import { useEffect, useRef, useState } from "react";

/** A plain countdown for rehearsing a time-boxed oral round. */
export function MootTimer() {
  const [minutes, setMinutes] = useState(10);
  const [left, setLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) setRunning(false);
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    endRef.current = Date.now() + left * 1000;
    setRunning(true);
  }
  function reset() {
    setRunning(false);
    setLeft(minutes * 60);
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const btn =
    "inline-flex h-11 items-center rounded-seal border px-5 text-[14.5px] font-medium transition-colors";

  return (
    <div className="max-w-sm rounded-seal border border-ink/20 bg-paper-raised p-6">
      <p className="label-mono text-indigo">Oral round timer</p>
      <p
        className="mt-4 font-display text-[3.2rem] font-semibold leading-none tabular-nums text-ink"
        role="timer"
        aria-live="off"
      >
        {mm}:{ss}
      </p>
      <p className="mt-2 min-h-5 text-[13px] text-ink-soft">
        {left === 0 ? "Time. Please conclude." : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {running ? (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className={`${btn} border-ink/45 text-ink hover:bg-ink/[0.04]`}
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={left === 0}
            className={`${btn} border-transparent bg-ink text-paper-raised hover:bg-ink-soft disabled:opacity-45`}
          >
            Start
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className={`${btn} border-ink/45 text-ink hover:bg-ink/[0.04]`}
        >
          Reset
        </button>
        <label className="ml-auto flex items-center gap-2 text-[13px] text-ink-soft">
          Minutes
          <input
            type="number"
            min={1}
            max={60}
            value={minutes}
            onChange={(e) => {
              const v = Math.min(60, Math.max(1, Number(e.target.value) || 1));
              setMinutes(v);
              if (!running) setLeft(v * 60);
            }}
            className="h-9 w-16 rounded-seal border border-ink/45 bg-paper px-2 text-[14px] text-ink"
          />
        </label>
      </div>
    </div>
  );
}
