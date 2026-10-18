import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialError =
    params.error === "link-expired"
      ? "That link has expired. Request a new one from the sign-in page."
      : null;

  return (
    <AuthCard>
      <LoginForm initialError={initialError} />
    </AuthCard>
  );
}
