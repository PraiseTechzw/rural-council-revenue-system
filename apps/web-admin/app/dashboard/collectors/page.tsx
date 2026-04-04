"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCollector, listCollectors, updateCollector } from "@/api/collectors.api";
import { listUsers } from "@/api/users.api";
import { useAuth } from "@/components/providers/auth-provider";

const collectorSchema = z.object({
  userId: z.string().uuid(),
  wardId: z.string().uuid().optional().or(z.literal("")),
  employeeNumber: z.string().min(1).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active")
});

type CollectorFormValues = z.infer<typeof collectorSchema>;

export default function CollectorsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const collectorsQuery = useQuery({
    queryKey: ["collectors", "list"],
    queryFn: () => listCollectors({ page: 1, limit: 100 })
  });

  const usersQuery = useQuery({
    queryKey: ["users", "collectors"],
    queryFn: () => listUsers({ page: 1, limit: 100, roleName: "collector", isActive: true })
  });

  const selectedCollector = useMemo(() => collectorsQuery.data?.rows.find((row) => row.id === selectedId) ?? null, [collectorsQuery.data?.rows, selectedId]);

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
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { wardId?: string | null; employeeNumber?: string | null; status?: "active" | "inactive" } }) =>
      updateCollector(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collectors", "list"] });
    }
  });

  const canEdit = user?.role === "admin";

  return (
    <section className="dashboard-page reveal">
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
                {collectorsQuery.data?.rows.map((collector) => (
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
                ))}
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
                {usersQuery.data?.rows.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.firstName} {entry.lastName} ({entry.email})
                  </option>
                ))}
              </select>
              <input className="premium-input" placeholder="Ward ID (optional)" {...form.register("wardId")} disabled={!canEdit} />
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
                <input name="wardId" defaultValue={selectedCollector.wardId ?? ""} className="premium-input" disabled={!canEdit} />
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
