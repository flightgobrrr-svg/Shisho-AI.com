import { useState } from "react";
import { Field } from "@/ui/components";
import { ToolRunner } from "@/features/ToolRunner";
import { MAX_TOOL_TEXT_CHARS } from "@/lib/toolTypes";

/** For corporate lawyers: a contract marked up clause by clause, against the Indian provision. */
export default function ContractReview() {
  const [text, setText] = useState("");
  const [actingFor, setActingFor] = useState("");
  return (
    <ToolRunner
      photo={require("../../../assets/screens/contract-review.jpg")}
      tool="contract-review"
      eyebrow="For corporate lawyers"
      headline="A contract, marked up *clause by clause*."
      intro="Paste a contract or attach it. Shisho notes each clause that matters (must fix, consider, or sound), names the Indian provision behind the note, and lists what the contract leaves out."
      acceptsFile
      runLabel="Review the contract"
      build={(hasFile) =>
        text.trim() || hasFile ? { text: text.trim() || undefined, actingFor: actingFor.trim() || undefined } : "Paste the contract or attach it."
      }
      saveTitle={(r) => r.output.contractType || "Contract review"}
    >
      <Field label="You act for (optional)" value={actingFor} onChangeText={setActingFor} placeholder="The licensee; the employer; the buyer" />
      <Field
        label="The contract"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={MAX_TOOL_TEXT_CHARS}
        placeholder="Paste the full text, or attach the file below."
        style={{ minHeight: 180, textAlignVertical: "top" }}
      />
    </ToolRunner>
  );
}
