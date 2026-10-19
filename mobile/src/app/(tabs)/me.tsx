import { Notice, Row, Screen, T } from "@/ui/components";
import { apiConfigured } from "@/api/client";
import { useSession } from "@/state/auth";

export default function Me() {
  const { session } = useSession();

  return (
    <Screen gap={4}>
      {apiConfigured ? (
        <Row
          title={session ? session.user.email : "Sign in or create an account"}
          detail={session ? "Your account, plan and sign out" : "Optional. Everything offline works without one"}
          href="/account"
        />
      ) : (
        <Notice
          title="No account in this build"
          body="Online features are off, so there is nothing to sign in to. Everything offline works."
        />
      )}
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>About</T>
      <Row title="Who it's for" detail="Advocates, students, exams, the bench and the public" href="/for" />
      <Row title="What works today" detail="Live, offline and planned" href="/works-today" />
      <Row title="How Shisho works" detail="What is saved, what is checked" href="/info/how" />
      <Row title="Corrections and known gaps" detail="What we leave out, and why" href="/info/corrections" />
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>Legal</T>
      <Row title="Terms of use" href="/info/terms" />
      <Row title="Privacy policy" href="/info/privacy" />
      <Row title="Refund policy" href="/info/refund" />
      <Row title="About Shisho AI" href="/info/about" />
      <T v="small" tone="faint" style={{ marginTop: 16 }}>
        Appearance follows your phone's light or dark setting.
      </T>
    </Screen>
  );
}
