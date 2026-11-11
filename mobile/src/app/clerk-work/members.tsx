import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Chip, Field, Notice, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { SectionRule } from "@/ui/web";
import { describeError } from "@/api/client";
import { clerk } from "@/api/clerk";
import { useSession } from "@/state/auth";
import { ROLES, ROLE_LABELS, can, type Role } from "@/lib/clerkWork";
import { useLoad } from "@/features/clerkUi";

/** Who works in the office and in what role. Only the administrator changes it. */
export default function Members() {
  const { office } = useLocalSearchParams<{ office: string }>();
  const { session } = useSession();
  const members = useLoad(() => clerk.members(office!).then((r) => r.members), [office]);
  const mine = members.data?.find((m) => m.user_id === session?.user.id);
  const admin = mine ? can(mine.role, "manage_members") : false;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("clerk");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = async (b: { email: string; role?: Role; remove?: boolean }) => {
    setBusy(true);
    setMsg(null);
    try {
      await clerk.setMember(office!, b);
      setMsg(b.remove ? "Removed." : "Saved.");
      setEmail("");
      await members.reload();
    } catch (e) {
      setMsg(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  if (members.loading && !members.data) return <Screen><ActivityIndicator /></Screen>;
  if (members.error) return <Screen><Notice title="Could not load the members" body={members.error} /></Screen>;
  return (
    <Screen>
      <T v="label" tone="indigo">Office members</T>
      {(members.data ?? []).filter((m) => m.active).map((m) => (
        <View key={m.user_id} style={{ gap: 2 }}>
          <T v="h3">{m.email || "A member"}</T>
          <T v="small" tone="soft">{ROLE_LABELS[m.role]}</T>
          {admin && m.user_id !== session?.user.id ? <TextButton label="Remove" onPress={() => set({ email: m.email, remove: true })} /> : null}
        </View>
      ))}
      {admin ? (
        <>
          <SectionRule />
          <T v="h2">Add someone, or change a role</T>
          <T v="small" tone="soft">They need a Shisho account. Only an advocate or the administrator can approve a document as ready for execution; clerks and juniors prepare.</T>
          <Field label="Their Shisho account email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {ROLES.map((r) => <Chip key={r} label={ROLE_LABELS[r]} selected={role === r} onPress={() => setRole(r)} />)}
          </View>
          <Button label={busy ? "Saving…" : "Save"} disabled={busy || !email.includes("@")} onPress={() => set({ email: email.trim(), role })} />
        </>
      ) : null}
      {msg ? <T v="small" tone="soft">{msg}</T> : null}
    </Screen>
  );
}
