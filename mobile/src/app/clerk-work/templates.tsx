import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Card, Notice, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { describeError } from "@/api/client";
import { clerk } from "@/api/clerk";
import { can } from "@/lib/clerkWork";
import { selectedOffice, useLoad, when, workTitle } from "@/features/clerkUi";

/**
 * The template library: every confirmed mapping of a court's blank form, by
 * version. An approved version is never changed; a different mapping becomes
 * the next version the next time the form is used.
 */
export default function Templates() {
  const params = useLocalSearchParams<{ office?: string }>();
  const { value: saved } = selectedOffice.use();
  const office = params.office ?? saved ?? "";
  const list = useLoad(() => clerk.templates(office), [office]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (list.loading && !list.data) return <Screen><ActivityIndicator /></Screen>;
  if (list.error || !list.data) return <Screen><Notice title="Could not load templates" body={list.error ?? ""} /></Screen>;
  const { templates, people, role } = list.data;
  const act = async (id: string, action: "approve" | "archive" | "activate" | "reviewed") => {
    setBusy(id);
    setError(null);
    try {
      await clerk.templateAction(id, action);
      await list.reload();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <T v="label" tone="indigo">Template library</T>
      <T v="small" tone="soft">A template is saved when a blank form is mapped and "Remember this mapping" is on. Shisho fills only the blanks recorded here; signature, seal, attestation and court-use spaces are never mapped.</T>
      {templates.length === 0 ? <T v="small" tone="soft">No templates yet. Upload a court's blank form on a case and generate from it.</T> : null}
      {error ? <T v="small" tone="seal">{error}</T> : null}
      {templates.map((t) => (
        <Card key={t.id} style={{ gap: 4 }}>
          <T v="h3" style={{ fontSize: 16 }}>{t.name}</T>
          <T v="small" tone="soft">{workTitle(t.work_no)} · version {t.version} · {t.status === "active" ? "Active" : "Archived"} · {t.fields} blanks mapped</T>
          <T v="small" tone="faint">{[t.forum, t.district, t.state, t.proceeding_type].filter(Boolean).join(" · ") || "Forum not recorded"}</T>
          <T v="small" tone="faint">Created {when(t.created_at)} by {t.created_by ? (people[t.created_by] ?? "a member") : "a former member"}{t.approved_at ? ` · approved ${when(t.approved_at)} by ${people[t.approved_by ?? ""] ?? "an advocate"}` : " · not yet approved"}{t.last_reviewed_at ? ` · reviewed ${when(t.last_reviewed_at)}` : ""}</T>
          {can(role, "approve") ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.lg }}>
              {!t.approved_at ? <TextButton label={busy === t.id ? "…" : "Approve"} onPress={() => act(t.id, "approve")} /> : <TextButton label="Mark reviewed" onPress={() => act(t.id, "reviewed")} />}
              {t.status === "active" ? <TextButton label="Archive" onPress={() => act(t.id, "archive")} /> : <TextButton label="Make active" onPress={() => act(t.id, "activate")} />}
            </View>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
