// Lets tests import modules that use the "@/..." path alias (tsconfig paths).
// Registered by the test files that need it; maps "@/x/y" to "<root>/x/y.ts".
const root = new URL("../", import.meta.url);

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    return next(new URL(`${specifier.slice(2)}.ts`, root).href, context);
  }
  return next(specifier, context);
}
