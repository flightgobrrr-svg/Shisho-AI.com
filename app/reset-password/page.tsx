import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <ResetPasswordForm />
    </AuthCard>
  );
}
