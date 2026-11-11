import { useState, type ReactNode } from "react";
import { Linking, Pressable, View } from "react-native";
import { T } from "@/ui/components";
import { fonts, space, usePalette } from "@/ui/theme";
import type { CheckedAuthority, Severity, ToolId, ToolOutput, ToolResult } from "@/lib/toolTypes";

/**
 * How each Shisho tool's answer reads in the app, and the same answer as
 * plain text for copying and sharing. Every authority carries its check:
 * "Verified" links to its source; anything else says "Check before relying".
 */

const SEVERITY: Record<Severity, string> = { "must-fix": "Must fix", consider: "Consider", good: "Sound" };

export function Authority({ a, extra }: { a: CheckedAuthority; extra?: string }) {
  const p = usePalette();
  return (
    <View style={{ gap: 2, paddingVertical: 6 }}>
      <T v="small" style={{ fontFamily: fonts.sansSemi }}>{a.text}</T>
      {extra ? <T v="small" tone="soft">{extra}</T> : null}
      {a.verified ? (
        a.sourceUrl ? (
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(a.sourceUrl!)} hitSlop={6}>
            <T v="label" tone="indigo" style={{ textDecorationLine: "underline" }}>Verified · open the source</T>
          </Pressable>
        ) : (
          <T v="label" tone="indigo">Verified</T>
        )
      ) : (
        <T v="label" style={{ color: p.seal }}>Check before relying · not in Shisho&apos;s verified list</T>
      )}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const p = usePalette();
  return (
    <View style={{ gap: space.xs, borderTopWidth: 1, borderTopColor: p.line, paddingTop: space.md }}>
      <T v="label" tone="indigo">{title}</T>
      {children}
    </View>
  );
}

const Bullets = ({ items, empty }: { items: string[]; empty?: string }) =>
  items.length ? (
    <View style={{ gap: 6 }}>
      {items.map((t, i) => (
        <T key={i} v="small">•  {t}</T>
      ))}
    </View>
  ) : empty ? (
    <T v="small" tone="faint">{empty}</T>
  ) : null;

function QA({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <View style={{ gap: space.sm }}>
      {items.map((q, i) => (
        <Pressable key={i} onPress={() => setOpen({ ...open, [i]: !open[i] })} accessibilityRole="button" accessibilityHint="Shows or hides the answer">
          <T v="small" style={{ fontFamily: fonts.sansSemi }}>{i + 1}. {q.question}</T>
          {open[i] ? <T v="small" tone="soft" style={{ marginTop: 2 }}>{q.answer}</T> : <T v="label" tone="faint">Tap for the answer</T>}
        </Pressable>
      ))}
    </View>
  );
}

export function ToolOutputView({ result }: { result: ToolResult }) {
  const p = usePalette();
  const o = result.output as ToolOutput[ToolId];
  const demo = result.mode === "demo" ? (
    <T v="small" tone="seal">Demo answer: no AI model is connected to this build, so this is a format example.</T>
  ) : null;

  switch (result.tool) {
    case "contract-review": {
      const r = o as ToolOutput["contract-review"];
      return (
        <View style={{ gap: space.md }}>
          {demo}
          <T v="label" tone="faint">{r.contractType}</T>
          <T>{r.summary}</T>
          <Section title={`Clause notes (${r.clauses.length})`}>
            {r.clauses.map((c, i) => (
              <View key={i} style={{ gap: 4, borderLeftWidth: 2, borderLeftColor: c.severity === "must-fix" ? p.seal : p.line, paddingLeft: space.md, marginTop: space.sm }}>
                <T v="label" tone={c.severity === "must-fix" ? "seal" : "faint"}>{SEVERITY[c.severity]}</T>
                <T v="h3" style={{ fontSize: 16 }}>{c.clause}</T>
                <T v="small" tone="soft">{c.note}</T>
                {c.provision ? <Authority a={c.provision} /> : null}
              </View>
            ))}
          </Section>
          <Section title="Not in the contract">
            <Bullets items={r.missing} empty="Nothing obvious is missing." />
          </Section>
        </View>
      );
    }
    case "case-record": {
      const r = o as ToolOutput["case-record"];
      return (
        <View style={{ gap: space.md }}>
          {demo}
          <T v="h2">{r.caseTitle}</T>
          <T v="small" tone="soft">{[r.forum, r.stage].filter(Boolean).join(" · ")}</T>
          <Section title="Parties">
            {r.parties.map((x, i) => <T key={i} v="small">{x.name} — {x.role}</T>)}
          </Section>
          <Section title="Issues">
            {r.issues.map((x, i) => <T key={i} v="small">{i + 1}. {x}</T>)}
          </Section>
          <Section title="Facts not in dispute"><Bullets items={r.agreedFacts} empty="None recorded." /></Section>
          <Section title="Facts in dispute"><Bullets items={r.disputedFacts} empty="None recorded." /></Section>
          <Section title="Chronology">
            {r.chronology.length ? r.chronology.map((x, i) => (
              <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                <T v="mono" style={{ width: 96 }}>{x.date}</T>
                <T v="small" style={{ flex: 1 }}>{x.event}</T>
              </View>
            )) : <T v="small" tone="faint">No dates in the papers.</T>}
          </Section>
          <Section title="Authorities relied on">
            {r.authorities.length ? r.authorities.map((a, i) => <Authority key={i} a={a} extra={`${a.reliedBy}: ${a.proposition}`} />) : <T v="small" tone="faint">None cited in the papers.</T>}
          </Section>
          <Section title="Orders so far">
            {r.orders.length ? r.orders.map((x, i) => <T key={i} v="small">{x.date}: {x.order}</T>) : <T v="small" tone="faint">None recorded.</T>}
          </Section>
          <Section title="Not on the record"><Bullets items={r.gaps} empty="No gaps noted." /></Section>
        </View>
      );
    }
    case "lesson-plan": {
      const r = o as ToolOutput["lesson-plan"];
      return (
        <View style={{ gap: space.md }}>
          {demo}
          <T v="h2">{r.title}</T>
          <Section title="By the end of class"><Bullets items={r.objectives} /></Section>
          <Section title="Plan">
            {r.outline.map((x, i) => (
              <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                <T v="mono" style={{ width: 64 }}>{x.minutes}</T>
                <T v="small" style={{ flex: 1 }}>{x.activity}</T>
              </View>
            ))}
          </Section>
          <Section title="Cases to read">
            {r.cases.length ? r.cases.map((c, i) => <Authority key={i} a={c} extra={c.why} />) : <T v="small" tone="faint">No judgment in the verified Library fits this topic.</T>}
          </Section>
          <Section title="Provisions">
            {r.provisions.map((c, i) => <Authority key={i} a={c} extra={c.why} />)}
          </Section>
          <Section title="For discussion"><Bullets items={r.discussion} /></Section>
          <Section title="Assessment"><QA items={r.assessment} /></Section>
        </View>
      );
    }
    case "plain-answer": {
      const r = o as ToolOutput["plain-answer"];
      return (
        <View style={{ gap: space.md }}>
          {demo}
          <T>{r.summary}</T>
          <Section title="What it means"><Bullets items={r.whatItMeans} /></Section>
          <Section title="Time limits"><Bullets items={r.deadlines} empty="No time limit was found." /></Section>
          <Section title="What you can do next"><Bullets items={r.nextSteps} /></Section>
          {r.provisions.length ? (
            <Section title="The law it rests on">
              {r.provisions.map((a, i) => <Authority key={i} a={a} />)}
            </Section>
          ) : null}
        </View>
      );
    }
    case "exam-revision": {
      const r = o as ToolOutput["exam-revision"];
      return (
        <View style={{ gap: space.md }}>
          {demo}
          <T v="h2">{r.module}</T>
          <Section title="Key points"><Bullets items={r.keyPoints} /></Section>
          {r.provisions.length ? (
            <Section title="Provisions">
              {r.provisions.map((a, i) => <Authority key={i} a={a} />)}
            </Section>
          ) : null}
          <Section title="Test yourself"><QA items={r.questions} /></Section>
        </View>
      );
    }
  }
  return null;
}

const mark = (a: CheckedAuthority) => `${a.text}${a.verified ? "" : " [check before relying]"}`;
const lines = (title: string, items: string[]) => (items.length ? `\n${title}\n${items.map((t) => `- ${t}`).join("\n")}` : "");

/** The answer as plain text, for copy and share. */
export function toolText(result: ToolResult): string {
  const o = result.output as ToolOutput[ToolId];
  const foot = "\n\nPrepared with Shisho AI. Educational assistance, not legal advice.";
  switch (result.tool) {
    case "contract-review": {
      const r = o as ToolOutput["contract-review"];
      return `${r.contractType}\n${r.summary}\n\n${r.clauses.map((c, i) => `${i + 1}. ${SEVERITY[c.severity]}: ${c.clause}\n${c.note}${c.provision ? `\n${mark(c.provision)}` : ""}`).join("\n\n")}${lines("Not in the contract", r.missing)}${foot}`;
    }
    case "case-record": {
      const r = o as ToolOutput["case-record"];
      return `${r.caseTitle}\n${[r.forum, r.stage].filter(Boolean).join(" · ")}${lines("Parties", r.parties.map((x) => `${x.name} — ${x.role}`))}${lines("Issues", r.issues)}${lines("Facts not in dispute", r.agreedFacts)}${lines("Facts in dispute", r.disputedFacts)}${lines("Chronology", r.chronology.map((x) => `${x.date}: ${x.event}`))}${lines("Authorities relied on", r.authorities.map((a) => `${mark(a)} (${a.reliedBy}: ${a.proposition})`))}${lines("Orders", r.orders.map((x) => `${x.date}: ${x.order}`))}${lines("Not on the record", r.gaps)}${foot}`;
    }
    case "lesson-plan": {
      const r = o as ToolOutput["lesson-plan"];
      return `${r.title}${lines("Objectives", r.objectives)}${lines("Plan", r.outline.map((x) => `${x.minutes}: ${x.activity}`))}${lines("Cases", r.cases.map((c) => `${c.text} — ${c.why}`))}${lines("Provisions", r.provisions.map((c) => `${mark(c)} — ${c.why}`))}${lines("Discussion", r.discussion)}${lines("Assessment", r.assessment.map((q) => `${q.question}\n  Answer: ${q.answer}`))}${foot}`;
    }
    case "plain-answer": {
      const r = o as ToolOutput["plain-answer"];
      return `${r.summary}${lines("What it means", r.whatItMeans)}${lines("Time limits", r.deadlines)}${lines("Next steps", r.nextSteps)}${lines("The law", r.provisions.map(mark))}${foot}`;
    }
    case "exam-revision": {
      const r = o as ToolOutput["exam-revision"];
      return `${r.module}${lines("Key points", r.keyPoints)}${lines("Provisions", r.provisions.map(mark))}${lines("Questions", r.questions.map((q) => `${q.question}\n  Answer: ${q.answer}`))}${foot}`;
    }
  }
  return "";
}
