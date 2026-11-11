import { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { Button, Card, Chip, Field, Notice, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { API_URL, ApiError, apiConfigured, describeError } from "@/api/client";
import { deleteAccount, fetchMe, register, signIn, type Plan } from "@/api/endpoints";
import { clearSession, saveSession, useSession } from "@/state/auth";
import { PLAN_LABEL } from "@/features/plans";

type Mode = "signin" | "register" | "forgot";


export default function Account() {
  const { session } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [until, setUntil] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Show the plan from the server; fail quietly (offline) and show the email alone.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchMe()
      .then((r) => {
        if (cancelled) return;
        setPlan(r.plan);
        setUntil(r.planExpiresAt ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!apiConfigured) {
    return (
      <Screen>
        <Notice
          title="Online features are off in this build"
          body="Accounts need Shisho's online service. Everything else in the app works without it."
        />
      </Screen>
    );
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const r = await signIn(email.trim(), password);
        saveSession(r.session);
        setPlan(r.plan);
        setPassword("");
      } else if (mode === "register") {
        const r = await register(email.trim(), password);
        if (r.confirmEmail) {
          setInfo("Check your email to confirm your address, then sign in.");
          setMode("signin");
        } else {
          saveSession(r.session);
          setPlan(r.plan);
        }
        setPassword("");
      }
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeAccount() {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      clearSession();
      setConfirmDelete(false);
      setInfo("Your account has been deleted.");
    } catch (e) {
      setError(e instanceof ApiError && e.kind === "http" ? e.message : describeError(e));
    } finally {
      setBusy(false);
    }
  }

  if (session) {
    return (
      <Screen>
        <Card>
          <T v="label" tone="indigo">Signed in</T>
          <T v="h3">{session.user.email}</T>
          <T v="small" tone="soft">
            Plan: {plan ? PLAN_LABEL[plan] : "checking…"}
            {until ? `, until ${new Date(until).toLocaleDateString("en-IN")}` : ""}
          </T>
        </Card>
        <Button label={plan && plan !== "free" ? "Plans and renewal" : "See plans"} href="/pricing" variant="ghost" />
        {info ? <T tone="soft">{info}</T> : null}
        {error ? <T tone="seal" accessibilityLiveRegion="polite">{error}</T> : null}
        <Button label="Sign out" variant="ghost" onPress={() => clearSession()} />

        <T v="label" tone="indigo" style={{ marginTop: 16 }}>Delete my account</T>
        <T v="small" tone="soft">
          This removes your account and your usage record from Shisho. Case briefs saved on this phone stay until you clear the app's data. It cannot be undone.
        </T>
        {confirmDelete ? (
          <View style={{ gap: space.sm }}>
            <T v="small" tone="seal">Tap again to delete {session.user.email} permanently.</T>
            <Button label={busy ? "Deleting…" : "Yes, delete my account"} variant="dark" disabled={busy} onPress={removeAccount} />
            <TextButton label="Cancel" onPress={() => setConfirmDelete(false)} />
          </View>
        ) : (
          <Button label="Delete my account" variant="ghost" onPress={() => setConfirmDelete(true)} />
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <T tone="soft">
        An account lets Shisho apply your plan. Everything else in the app works without one.
      </T>
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
        <Chip label="Sign in" selected={mode === "signin"} onPress={() => { setMode("signin"); setError(null); setInfo(null); }} />
        <Chip label="Create account" selected={mode === "register"} onPress={() => { setMode("register"); setError(null); setInfo(null); }} />
        <Chip label="Forgot password" selected={mode === "forgot"} onPress={() => { setMode("forgot"); setError(null); setInfo(null); }} />
      </View>

      {mode === "forgot" ? (
        /* The reset runs in the phone's browser, on the website. A reset asked
           for from inside the app could not finish: the emailed link has to be
           opened in the same browser that asked for it. Tested end to end. */
        <Card>
          <T v="h3">Reset your password on the website</T>
          <T v="small" tone="soft">
            This opens Shisho's reset page in your browser. Ask for the link there, open the email on this
            phone, choose a new password, then come back and sign in here.
          </T>
          <Button
            label="Open the reset page"
            variant="dark"
            onPress={() => {
              Linking.openURL(`${API_URL}/forgot-password`).catch(() =>
                setError("Your browser did not open. Go to the Shisho website and choose Forgot password."),
              );
            }}
          />
        </Card>
      ) : (
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          textContentType="emailAddress"
        />
      )}
      {mode !== "forgot" ? (
        <Field
          label={mode === "register" ? "Password (8 or more characters)" : "Password"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          textContentType={mode === "register" ? "newPassword" : "password"}
          onSubmitEditing={submit}
        />
      ) : null}

      {info ? <T tone="soft" accessibilityLiveRegion="polite">{info}</T> : null}
      {error ? <T tone="seal" accessibilityLiveRegion="polite">{error}</T> : null}

      {mode !== "forgot" ? (
        <Button
          label={busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          variant="dark"
          disabled={busy || !email.trim() || !password}
          onPress={submit}
        />
      ) : null}
      {mode === "register" ? (
        <T v="small" tone="faint">
          By creating an account you agree to the terms of use. Shisho is educational and drafting help, not legal advice.
        </T>
      ) : null}
    </Screen>
  );
}
