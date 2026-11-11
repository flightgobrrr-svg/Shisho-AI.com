import { View } from "react-native";
import { Chip, Field, T, TextButton } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import type { InputDef } from "@/lib/clerkServices";
import type { EntryField } from "@/lib/clerkRegisters";

/**
 * One form for every Clerk Work question: a typed service's inputs
 * (lib/clerkServices.ts) and a register's fields (lib/clerkRegisters.ts).
 * Dates are typed as DD-MM-YYYY (the server reads them day-first and refuses
 * anything it cannot read with certainty), so no date picker is needed.
 */

export type FormValues = Record<string, string | string[][]>;
type Def = (InputDef | EntryField) & { type: string; columns?: readonly string[] };

export function ClerkForm({ defs, values, onChange }: { defs: Def[]; values: FormValues; onChange: (v: FormValues) => void }) {
  const set = (k: string, v: string | string[][]) => onChange({ ...values, [k]: v });
  return (
    <View style={{ gap: space.md }}>
      {defs.map((d) => (
        <FieldFor key={d.key} def={d} value={values[d.key]} onChange={(v) => set(d.key, v)} />
      ))}
    </View>
  );
}

function FieldFor({ def, value, onChange }: { def: Def; value: string | string[][] | undefined; onChange: (v: string | string[][]) => void }) {
  const p = usePalette();
  const label = `${def.label}${def.required ? "" : " (optional)"}`;
  const s = typeof value === "string" ? value : "";
  switch (def.type) {
    case "choice":
      return (
        <View style={{ gap: space.xs }}>
          <T v="label" tone="indigo">{label}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {(def.options ?? []).map((o) => <Chip key={o} label={o} selected={s === o} onPress={() => onChange(s === o && !def.required ? "" : o)} />)}
          </View>
        </View>
      );
    case "yesno":
      return (
        <View style={{ gap: space.xs }}>
          <T v="label" tone="indigo">{label}</T>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {["Yes", "No"].map((o) => <Chip key={o} label={o} selected={s === o} onPress={() => onChange(o)} />)}
          </View>
        </View>
      );
    case "date":
      return <Field label={label} value={s} onChangeText={onChange} placeholder={def.hint ?? "DD-MM-YYYY"} keyboardType="numbers-and-punctuation" autoCapitalize="none" maxLength={10} />;
    case "money":
    case "number":
      return <Field label={label} value={s} onChangeText={onChange} placeholder={def.hint} keyboardType="decimal-pad" />;
    case "long":
    case "paras":
      return <Field label={label} value={s} onChangeText={onChange} placeholder={def.hint ?? (def.type === "paras" ? "One paragraph per line" : undefined)} multiline style={{ minHeight: def.type === "paras" ? 140 : 90, textAlignVertical: "top" }} />;
    case "list": {
      const cols = def.columns ?? [];
      const rows = Array.isArray(value) && value.length ? value : [cols.map(() => "")];
      const setCell = (r: number, c: number, v: string) => onChange(rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)));
      return (
        <View style={{ gap: space.sm }}>
          <T v="label" tone="indigo">{label}</T>
          {rows.map((row, r) => (
            <View key={r} style={{ gap: 6, borderLeftWidth: 2, borderLeftColor: p.line, paddingLeft: space.md }}>
              <T v="small" tone="faint">{r + 1}.</T>
              {cols.map((c, j) => (
                <Field key={c} label={c} value={row[j] ?? ""} onChangeText={(v) => setCell(r, j, v)} />
              ))}
              {rows.length > 1 ? <TextButton label="Remove this row" onPress={() => onChange(rows.filter((_, i) => i !== r))} /> : null}
            </View>
          ))}
          <TextButton label="Add a row" onPress={() => onChange([...rows, cols.map(() => "")])} />
        </View>
      );
    }
    default:
      return <Field label={label} value={s} onChangeText={onChange} placeholder={def.hint} />;
  }
}

/** Required entries still empty, by label (the server checks again). */
export function missingIn(defs: Def[], values: FormValues): string[] {
  return defs
    .filter((d) => d.required)
    .filter((d) => {
      const v = values[d.key];
      return d.type === "list" ? !Array.isArray(v) || !v.some((r) => r.some((x) => x.trim())) : typeof v !== "string" || !v.trim();
    })
    .map((d) => d.label);
}
