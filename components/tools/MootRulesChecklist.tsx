"use client";

import { useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/localStore";

type Item = { id: string; text: string; done: boolean };

const store = createLocalStore("shisho-moot-rules");

function parse(raw: string | null | undefined): Item[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Every moot has its own rules. This is a checklist the team writes from
 * theirs — page limit, font, order of sections, word count — and ticks off
 * before submitting. Stored in this browser only.
 */
export function MootRulesChecklist() {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const items = parse(raw);
  const [text, setText] = useState("");

  const save = (next: Item[]) => store.set(JSON.stringify(next));

  function add() {
    const t = text.trim();
    if (!t) return;
    save([...items, { id: String(Date.now()), text: t, done: false }]);
    setText("");
  }

  return (
    <div className="max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex gap-3"
      >
        <label htmlFor="moot-rule" className="sr-only">
          A rule from your moot
        </label>
        <input
          id="moot-rule"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Memorial within 30 pages"
          className="h-11 min-w-0 flex-1 rounded-seal border border-ink/45 bg-paper px-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-ink/80"
        />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center rounded-seal border border-transparent bg-ink px-5 text-[14.5px] font-medium text-paper-raised hover:bg-ink-soft"
        >
          Add
        </button>
      </form>

      {items.length > 0 ? (
        <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <input
                id={`rule-${item.id}`}
                type="checkbox"
                checked={item.done}
                onChange={() =>
                  save(items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))
                }
                className="size-4 accent-[var(--color-ink)]"
              />
              <label
                htmlFor={`rule-${item.id}`}
                className={`flex-1 text-[15px] ${item.done ? "text-ink-soft line-through" : "text-ink"}`}
              >
                {item.text}
              </label>
              <button
                type="button"
                onClick={() => save(items.filter((i) => i.id !== item.id))}
                className="underline-draw text-[13px] text-ink-soft"
                aria-label={`Remove: ${item.text}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[14px] text-ink-soft">
          Nothing yet. Copy the formal requirements from your moot rules.
        </p>
      )}
      <p className="mt-4 text-[13px] text-ink-soft">Saved in this browser only.</p>
    </div>
  );
}
