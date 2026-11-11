import { useState } from "react";
import { Field } from "@/ui/components";
import { ToolRunner } from "@/features/ToolRunner";
import { MAX_TOOL_TEXT_CHARS } from "@/lib/toolTypes";

/** For judges: the record arranged for the bench, neutrally, from the papers only. */
export default function CaseRecord() {
  const [text, setText] = useState("");
  return (
    <ToolRunner
      photo={require("../../../assets/screens/case-record.jpg")}
      tool="case-record"
      eyebrow="For judges"
      headline="A clear record, close at *hand*."
      intro="Paste the pleadings, or attach the case papers. Shisho arranges them for the bench: parties, issues, facts agreed and disputed, a chronology, the authorities each side relies on, orders so far, and what the record does not show. It stays neutral and never suggests an outcome."
      acceptsFile
      runLabel="Prepare the record"
      build={(hasFile) => (text.trim() || hasFile ? { text: text.trim() || undefined } : "Paste the case papers or attach them.")}
      saveTitle={(r) => r.output.caseTitle || "Case record"}
    >
      <Field
        label="The case papers"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={MAX_TOOL_TEXT_CHARS}
        placeholder="Plaint, written statement, applications, orders…"
        style={{ minHeight: 180, textAlignVertical: "top" }}
      />
    </ToolRunner>
  );
}
