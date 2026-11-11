import { useState } from "react";
import { View } from "react-native";
import { Chip, Field, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { ToolRunner } from "@/features/ToolRunner";
import { ANSWER_LANGUAGES, MAX_TOOL_TEXT_CHARS, type AnswerLanguage } from "@/lib/toolTypes";

/** For anyone: a notice or a court process explained in plain words. */
export default function PlainAnswer() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<AnswerLanguage>("en");
  return (
    <ToolRunner
      photo={require("../../../assets/screens/plain-answer.jpg")}
      tool="plain-answer"
      eyebrow="For everyone"
      headline="Know your rights, in plain *language*."
      intro="Received a legal notice, a summons or an order? Photograph it or paste it, or ask about a process in your own words. Shisho explains what it means, any time limit, and what you can do next."
      acceptsFile
      runLabel="Explain it"
      build={(hasFile) => (text.trim() || hasFile ? { text: text.trim() || undefined, language } : "Type your question, or attach the notice.")}
      saveTitle={(r) => r.output.summary.slice(0, 60) || "Plain-language answer"}
      footer={
        <T v="small" tone="soft">
          For a serious matter, speak to a lawyer. If you cannot afford one, your District Legal Services Authority can arrange free legal aid for those who qualify.
        </T>
      }
    >
      <T v="label" tone="indigo">Answer in</T>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        {(Object.keys(ANSWER_LANGUAGES) as AnswerLanguage[]).map((k) => (
          <Chip key={k} label={ANSWER_LANGUAGES[k]} selected={language === k} onPress={() => setLanguage(k)} />
        ))}
      </View>
      <Field
        label="Your question, or the text of the paper"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={MAX_TOOL_TEXT_CHARS}
        placeholder="I got a cheque-bounce notice. What does it mean?"
        style={{ minHeight: 140, textAlignVertical: "top" }}
      />
    </ToolRunner>
  );
}
