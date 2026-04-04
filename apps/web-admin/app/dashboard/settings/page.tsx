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
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your profile session and password.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
            className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            Logout
          </button>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
            <input type="password" placeholder="Current password" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...form.register("currentPassword")} />
            {form.formState.errors.currentPassword ? <p className="text-xs text-rose-600">{form.formState.errors.currentPassword.message}</p> : null}
            <input type="password" placeholder="New password" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...form.register("newPassword")} />
            {form.formState.errors.newPassword ? <p className="text-xs text-rose-600">{form.formState.errors.newPassword.message}</p> : null}
            <input type="password" placeholder="Confirm new password" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword ? <p className="text-xs text-rose-600">{form.formState.errors.confirmPassword.message}</p> : null}

            {errorMessage ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
            {resultMessage ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{resultMessage}</p> : null}

            <button className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Change password"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
