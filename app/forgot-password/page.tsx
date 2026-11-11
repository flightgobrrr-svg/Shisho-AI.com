import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
