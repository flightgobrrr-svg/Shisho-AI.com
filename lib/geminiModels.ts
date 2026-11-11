/**
 * SERVER ONLY. The Gemini models Shisho may use, in order, and the rule for
 * moving down the list. Gemini's free tier is often "high demand" (503) or out
 * of its per-model quota (429); each model below has its own quota bucket, so
 * a busy one hands over to the next instead of failing the request.
 *
 * All three were listed for this project's key by the ListModels API on
 * 21 October 2026. Check availability and quota again before changing them.
 * Used by app/api/assistant/route.ts and lib/aiTools.ts.
 */
export const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"] as const;

/** Busy or out of quota: worth trying the next model. Anything else is not. */
export const geminiBusy = (e: unknown) => /error (429|500|503)\b/.test(String(e));

/**
 * Runs `call` with each model in turn until one answers. A non-busy error
 * (a bad request, a blocked prompt) stops at once. When every model is busy,
 * the last error is thrown so the caller can fall back further or report it.
 */
export async function withGeminiFallback<T>(call: (model: string) => Promise<T>, label: string): Promise<T> {
  let last: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      return await call(model);
    } catch (e) {
      last = e;
      if (!geminiBusy(e)) break;
      console.warn(`[${label}] ${model} busy, trying the next model`);
    }
  }
  throw last;
}
