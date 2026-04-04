"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoadingAuth } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values);
      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in");
    }
  });

  return (
    <main>
      <header className="mb-6">
        <Image src="/logo.png" alt="RRDC logo" width={110} height={110} className="mb-4 h-20 w-20 rounded-xl border border-slate-200 bg-white object-contain p-1" />
        <h1 className="text-xl font-semibold text-slate-900">Web Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage rural council revenue operations.</p>
      </header>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            {...register("email")}
          />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            {...register("password")}
          />
          {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
        </div>

        {submitError ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
