"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCollector, listCollectors, updateCollector } from "@/api/collectors.api";
import { listUsers } from "@/api/users.api";
import { listWards } from "@/api/wards.api";
import { useAuth } from "@/components/providers/auth-provider";

const collectorSchema = z.object({
  userId: z.string().uuid(),
  wardId: z.string().uuid().optional().or(z.literal("")),
  employeeNumber: z.string().min(1).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active")
});

type CollectorFormValues = z.infer<typeof collectorSchema>;

type ToastState = {
  type: "success" | "error";
  message: string;
};

export default function CollectorsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const collectorsQuery = useQuery({
    queryKey: ["collectors", "list"],
    queryFn: () => listCollectors({ page: 1, limit: 100 })
  });

  const usersQuery = useQuery({
    queryKey: ["users", "collectors"],
    queryFn: () => listUsers({ page: 1, limit: 100, roleName: "collector", isActive: true })
  });

  const wardsQuery = useQuery({
    queryKey: ["wards", "collector-form"],
    queryFn: () => listWards({ page: 1, limit: 100 })
  });

  const selectedCollector = useMemo(() => collectorsQuery.data?.rows.find((row) => row.id === selectedId) ?? null, [collectorsQuery.data?.rows, selectedId]);
  const assignedCollectorUserIds = useMemo(() => new Set((collectorsQuery.data?.rows ?? []).map((entry) => entry.userId)), [collectorsQuery.data?.rows]);
  const availableCollectorUsers = useMemo(
    () => (usersQuery.data?.rows ?? []).filter((entry) => !assignedCollectorUserIds.has(entry.id)),
    [assignedCollectorUserIds, usersQuery.data?.rows]
  );

  const form = useForm<CollectorFormValues>({
    resolver: zodResolver(collectorSchema),
    defaultValues: {
      userId: "",
      wardId: "",
      employeeNumber: "",
      status: "active"
    }
  });

  const createMutation = useMutation({
    mutationFn: createCollector,
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["collectors", "list"] });
      setToast({ type: "success", message: "Collector created successfully." });
    },
    onError: (error) => {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to create collector." });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { wardId?: string | null; employeeNumber?: string | null; status?: "active" | "inactive" } }) =>
      updateCollector(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collectors", "list"] });
      setToast({ type: "success", message: "Collector updated successfully." });
    },
    onError: (error) => {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to update collector." });
    }
  });

  const canEdit = user?.role === "admin";

  return (
    <section className="dashboard-page reveal">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.message}</p>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs font-semibold uppercase tracking-wide opacity-70 transition hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header>
        <h1 className="dashboard-title">Collectors</h1>
        <p className="dashboard-subtitle">Manage assignment, employment metadata, and availability status.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="premium-panel p-4">
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Collector</th>
                  <th>Email</th>
                  <th>Employee #</th>
                  <th>Ward</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {collectorsQuery.isLoading ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={5}>
                      Loading collectors...
                    </td>
                  </tr>
                ) : collectorsQuery.isError ? (
                  <tr>
                    <td className="px-3 py-4 text-rose-700" colSpan={5}>
                      Failed to load collectors.
                    </td>
                  </tr>
                ) : collectorsQuery.data?.rows.length ? (
                  collectorsQuery.data.rows.map((collector) => (
                    <tr
                      key={collector.id}
                      className={`cursor-pointer border-t border-[#e9decb] ${selectedId === collector.id ? "bg-[#e7efe4]" : "hover:bg-[#f6f0e4]"}`}
                      onClick={() => setSelectedId(collector.id)}
                    >
                      <td className="px-3 py-2 text-slate-800">{collector.userFirstName} {collector.userLastName}</td>
                      <td className="px-3 py-2 text-slate-700">{collector.userEmail}</td>
                      <td className="px-3 py-2 text-slate-700">{collector.employeeNumber ?? "-"}</td>
                      <td className="px-3 py-2 text-slate-700">{collector.wardName ?? "-"}</td>
                      <td className="px-3 py-2 text-slate-700">{collector.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={5}>
                      No collectors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="premium-panel p-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Create Collector</h2>
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit(async (values) => {
                if (!canEdit) {
                  return;
                }

                await createMutation.mutateAsync({
                  userId: values.userId,
                  wardId: values.wardId || undefined,
                  employeeNumber: values.employeeNumber || undefined,
                  status: values.status
                });
              })}
            >
              <select className="premium-input" {...form.register("userId")} disabled={!canEdit}>
                <option value="">Select user</option>
                {availableCollectorUsers.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.firstName} {entry.lastName} ({entry.email})
                  </option>
                ))}
              </select>
              <select className="premium-input" {...form.register("wardId")} disabled={!canEdit || wardsQuery.isLoading || wardsQuery.isError}>
                <option value="">No ward assigned</option>
                {wardsQuery.data?.rows.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name} ({ward.code})
                  </option>
                ))}
              </select>
              <input className="premium-input" placeholder="Employee number" {...form.register("employeeNumber")} disabled={!canEdit} />
              <select className="premium-input" {...form.register("status")} disabled={!canEdit}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="premium-button w-full" disabled={!canEdit || createMutation.isPending} type="submit">
                {createMutation.isPending ? "Saving..." : "Create collector"}
              </button>
            </form>
          </div>

          <div className="premium-panel p-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Update Selected</h2>
            {!selectedCollector ? (
              <p className="text-sm text-slate-500">Select a collector from the table.</p>
            ) : (
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!canEdit || !selectedCollector) {
                    return;
                  }

                  const formData = new FormData(event.currentTarget);
                  await updateMutation.mutateAsync({
                    id: selectedCollector.id,
                    payload: {
                      employeeNumber: (formData.get("employeeNumber") as string) || null,
                      wardId: (formData.get("wardId") as string) || null,
                      status: formData.get("status") as "active" | "inactive"
                    }
                  });
                }}
              >
                <select
                  name="wardId"
                  defaultValue={selectedCollector.wardId ?? ""}
                  className="premium-input"
                  disabled={!canEdit || wardsQuery.isLoading || wardsQuery.isError}
                >
                  <option value="">No ward assigned</option>
                  {wardsQuery.data?.rows.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name} ({ward.code})
                    </option>
                  ))}
                </select>
                <input name="employeeNumber" defaultValue={selectedCollector.employeeNumber ?? ""} className="premium-input" disabled={!canEdit} />
                <select name="status" defaultValue={selectedCollector.status} className="premium-input" disabled={!canEdit}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="premium-button-outline w-full" disabled={!canEdit || updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? "Updating..." : "Update collector"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
