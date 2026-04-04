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
    <section className="dashboard-page reveal">
      <header>
        <h1 className="dashboard-title">Wards</h1>
        <p className="dashboard-subtitle">Maintain ward registry for payer segmentation and collector assignment.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="premium-panel p-4">
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {wardsQuery.data?.rows.map((ward) => (
                  <tr
                    key={ward.id}
                    onClick={() => setSelectedId(ward.id)}
                    className={`cursor-pointer border-t border-[#e9decb] ${selectedId === ward.id ? "bg-[#e7efe4]" : "hover:bg-[#f6f0e4]"}`}
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
          <div className="premium-panel p-4">
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
              <input name="name" placeholder="Ward name" className="premium-input" required disabled={!canEdit} />
              <input name="code" placeholder="Ward code" className="premium-input" required disabled={!canEdit} />
              <textarea name="description" placeholder="Description" className="premium-input" rows={3} disabled={!canEdit} />
              <button className="premium-button w-full" type="submit" disabled={!canEdit || createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Create ward"}
              </button>
            </form>
          </div>

          <div className="premium-panel p-4">
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
                <input name="name" defaultValue={selectedWard.name} className="premium-input" disabled={!canEdit} />
                <input name="code" defaultValue={selectedWard.code} className="premium-input" disabled={!canEdit} />
                <textarea name="description" defaultValue={selectedWard.description ?? ""} className="premium-input" rows={3} disabled={!canEdit} />
                <button className="premium-button-outline w-full" disabled={!canEdit || updateMutation.isPending} type="submit">
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
