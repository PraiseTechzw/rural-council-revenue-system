"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRevenueSource, listRevenueSources, updateRevenueSource } from "@/api/revenueSources.api";
import { useAuth } from "@/components/providers/auth-provider";

export default function RevenueSourcesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sourceQuery = useQuery({
    queryKey: ["revenue-sources", "list"],
    queryFn: () => listRevenueSources({ page: 1, limit: 100 })
  });

  const canEdit = user?.role === "admin";
  const selectedSource = sourceQuery.data?.rows.find((entry) => entry.id === selectedId) ?? null;

  const createMutation = useMutation({
    mutationFn: createRevenueSource,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["revenue-sources", "list"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; code?: string; category?: string; description?: string | null; isActive?: boolean } }) =>
      updateRevenueSource(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["revenue-sources", "list"] });
    }
  });

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Revenue Sources</h1>
        <p className="mt-1 text-sm text-slate-600">Configure council charge categories and active collection sources.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sourceQuery.data?.rows.map((source) => (
                  <tr
                    key={source.id}
                    onClick={() => setSelectedId(source.id)}
                    className={`cursor-pointer border-t border-slate-100 ${selectedId === source.id ? "bg-brand-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-3 py-2 text-slate-800">{source.name}</td>
                    <td className="px-3 py-2 text-slate-700">{source.code}</td>
                    <td className="px-3 py-2 text-slate-700">{source.category}</td>
                    <td className="px-3 py-2 text-slate-700">{source.isActive ? "active" : "inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Create Source</h2>
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
                  category: String(formData.get("category") ?? "other"),
                  description: String(formData.get("description") ?? "") || undefined,
                  isActive: true
                });
                (event.currentTarget as HTMLFormElement).reset();
              }}
            >
              <input name="name" placeholder="Name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} required />
              <input name="code" placeholder="Code" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} required />
              <select name="category" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit}>
                <option value="shop_rental">shop_rental</option>
                <option value="housing_stand">housing_stand</option>
                <option value="mining_fee">mining_fee</option>
                <option value="market_levy">market_levy</option>
                <option value="other">other</option>
              </select>
              <textarea name="description" placeholder="Description" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} rows={3} />
              <button className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400" disabled={!canEdit || createMutation.isPending} type="submit">
                {createMutation.isPending ? "Saving..." : "Create source"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Update Selected</h2>
            {!selectedSource ? (
              <p className="text-sm text-slate-500">Select a source row to edit.</p>
            ) : (
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!canEdit || !selectedSource) {
                    return;
                  }

                  const formData = new FormData(event.currentTarget);
                  await updateMutation.mutateAsync({
                    id: selectedSource.id,
                    payload: {
                      name: String(formData.get("name") ?? "") || undefined,
                      code: String(formData.get("code") ?? "") || undefined,
                      category: String(formData.get("category") ?? "") || undefined,
                      description: String(formData.get("description") ?? "") || null,
                      isActive: String(formData.get("isActive")) === "true"
                    }
                  });
                }}
              >
                <input name="name" defaultValue={selectedSource.name} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} />
                <input name="code" defaultValue={selectedSource.code} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} />
                <input name="category" defaultValue={selectedSource.category} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} />
                <textarea name="description" defaultValue={selectedSource.description ?? ""} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit} rows={3} />
                <select name="isActive" defaultValue={selectedSource.isActive ? "true" : "false"} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" disabled={!canEdit}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50" disabled={!canEdit || updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? "Updating..." : "Update source"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
