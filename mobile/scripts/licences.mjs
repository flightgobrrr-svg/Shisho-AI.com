// Regenerates src/data/licences.json: every production package the app ships
// (from package-lock.json, dev-only packages left out) with its version and
// licence, for the open-source notices screen (src/app/licences.tsx).
// Run with `npm run licences` after adding or updating a dependency.
import { readFileSync, writeFileSync } from "node:fs";

const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const seen = new Map();
for (const [path, info] of Object.entries(lock.packages ?? {})) {
  if (!path.startsWith("node_modules/") || info.dev || info.devOptional) continue;
  const name = path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
  let license = info.license;
  if (!license) {
    try {
      const pkg = JSON.parse(readFileSync(new URL(`../${path}/package.json`, import.meta.url), "utf8"));
      license = pkg.license ?? pkg.licenses?.map((l) => l.type ?? l).join(" OR ");
    } catch {
      /* not installed on this platform: keep it, marked unknown */
    }
  }
  if (typeof license === "object" && license) license = license.type;
  seen.set(`${name}@${info.version}`, { name, version: info.version, license: license || "Not stated" });
}
const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(new URL("../src/data/licences.json", import.meta.url), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), packages: list }) + "\n");
console.log(`${list.length} packages written to src/data/licences.json`);
