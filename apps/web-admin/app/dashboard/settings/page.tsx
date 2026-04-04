"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/api/auth.api";
import { useAuth } from "@/components/providers/auth-provider";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"]
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  return (
    <section className="dashboard-page reveal">
      <header>
        <h1 className="dashboard-title">Settings</h1>
        <p className="dashboard-subtitle">Manage profile credentials, access role details, and session controls.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="premium-panel p-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Current User</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{user ? `${user.firstName} ${user.lastName}` : "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user?.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{user?.role ?? "-"}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="premium-button-outline mt-4"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            Logout
          </button>
        </article>

        <article className="premium-panel p-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Change Password</h2>

          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              setErrorMessage(null);
              setResultMessage(null);

              try {
                await changePassword({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword
                });
                setResultMessage("Password updated successfully.");
                form.reset();
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "Failed to change password");
              }
            })}
          >
            <input type="password" placeholder="Current password" className="premium-input" {...form.register("currentPassword")} />
            {form.formState.errors.currentPassword ? <p className="text-xs text-rose-600">{form.formState.errors.currentPassword.message}</p> : null}
            <input type="password" placeholder="New password" className="premium-input" {...form.register("newPassword")} />
            {form.formState.errors.newPassword ? <p className="text-xs text-rose-600">{form.formState.errors.newPassword.message}</p> : null}
            <input type="password" placeholder="Confirm new password" className="premium-input" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword ? <p className="text-xs text-rose-600">{form.formState.errors.confirmPassword.message}</p> : null}

            {errorMessage ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
            {resultMessage ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{resultMessage}</p> : null}

            <button className="premium-button w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Change password"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
