"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWard, listWards, updateWard } from "@/api/wards.api";
import { useAuth } from "@/components/providers/auth-provider";

export default function WardsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const wardsQuery = useQuery({
    queryKey: ["wards", "list"],
    queryFn: () => listWards({ page: 1, limit: 100 })
  });

  const selectedWard = wardsQuery.data?.rows.find((entry) => entry.id === selectedId) ?? null;
  const canEdit = user?.role === "admin";

  const createMutation = useMutation({
    mutationFn: createWard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wards", "list"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; code?: string; description?: string | null } }) => updateWard(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wards", "list"] });
    }
  });

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Wards</h1>
        <p className="mt-1 text-sm text-slate-600">Maintain ward records used for collector and payer mapping.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {wardsQuery.data?.rows.map((ward) => (
                  <tr
                    key={ward.id}
                    onClick={() => setSelectedId(ward.id)}
                    className={`cursor-pointer border-t border-slate-100 ${selectedId === ward.id ? "bg-brand-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-3 py-2 text-slate-800">{ward.name}</td>
                    <td className="px-3 py-2 text-slate-700">{ward.code}</td>
                    <td className="px-3 py-2 text-slate-700">{ward.description ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Create Ward</h2>
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canEdit) {
                  return;
                }

                const formData = new FormData(event.currentTarget);
                await createMutation.mutateAsync({
                  name: String(formData.get("name") ?? ""),
                  code: String(formData.get("code") ?? ""),
                  description: String(formData.get("description") ?? "") || undefined
                });
                (event.currentTarget as HTMLFormElement).reset();
              }}
            >
              <input name="name" placeholder="Ward name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required disabled={!canEdit} />
              <input name="code" placeholder="Ward code" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required disabled={!canEdit} />
              <textarea name="description" placeholder="Description" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={3} disabled={!canEdit} />
              <button className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400" type="submit" disabled={!canEdit || createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Create ward"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Update Selected</h2>
            {!selectedWard ? (
              <p className="text-sm text-slate-500">Select a ward row to edit.</p>
            ) : (
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!canEdit || !selectedWard) {
                    return;
                  }

                  const formData = new FormData(event.currentTarget);
                  await updateMutation.mutateAsync({
                    id: selectedWard.id,
                    payload: {
                      name: String(formData.get("name") ?? "") || undefined,
                      code: String(formData.get("code") ?? "") || undefined,
                      description: String(formData.get("description") ?? "") || null
                    }
                  });
                }}
              >
                <input name="name" defaultValue={selectedWard.name} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} />
                <input name="code" defaultValue={selectedWard.code} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} />
                <textarea name="description" defaultValue={selectedWard.description ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={3} disabled={!canEdit} />
                <button className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50" disabled={!canEdit || updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? "Updating..." : "Update ward"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
