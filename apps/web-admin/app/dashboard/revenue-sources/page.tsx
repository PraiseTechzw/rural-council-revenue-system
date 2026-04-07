"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRevenueSource, listRevenueSources, updateRevenueSource } from "@/api/revenueSources.api";
import { useAuth } from "@/components/providers/auth-provider";
import { queryKeys } from "@/constants/query-keys";

const categoryOptions = ["shop_rental", "housing_stand", "mining_fee", "market_levy", "other"] as const;
type StatusFilter = "all" | "active" | "inactive";
type Feedback = { type: "success" | "error"; message: string };

export default function RevenueSourcesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [createFeedback, setCreateFeedback] = useState<Feedback | null>(null);
  const [updateFeedback, setUpdateFeedback] = useState<Feedback | null>(null);

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(category ? { category } : {}),
      ...(status === "all" ? {} : { isActive: status === "active" })
    }),
    [category, search, status]
  );

  const sourceQuery = useQuery({
    queryKey: queryKeys.revenueSources(queryParams),
    queryFn: () => listRevenueSources(queryParams)
  });

  const canEdit = user?.role === "admin";
  const selectedSource = sourceQuery.data?.rows.find((entry) => entry.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const exists = sourceQuery.data?.rows.some((source) => source.id === selectedId);
    if (!exists) {
      setSelectedId(null);
    }
  }, [selectedId, sourceQuery.data?.rows]);

  const createMutation = useMutation({
    mutationFn: createRevenueSource,
    onSuccess: async () => {
      setCreateFeedback({ type: "success", message: "Revenue source added successfully." });
      await queryClient.invalidateQueries({ queryKey: ["revenue-sources"] });
    },
    onError: () => {
      setCreateFeedback({ type: "error", message: "Unable to add revenue source. Confirm values and try again." });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; code?: string; category?: string; description?: string | null; isActive?: boolean } }) =>
      updateRevenueSource(id, payload),
    onSuccess: async () => {
      setUpdateFeedback({ type: "success", message: "Revenue source updated successfully." });
      await queryClient.invalidateQueries({ queryKey: ["revenue-sources"] });
    },
    onError: () => {
      setUpdateFeedback({ type: "error", message: "Unable to update revenue source. Resolve errors and retry." });
    }
  });

  return (
    <section className="dashboard-page reveal">
      <header>
        <h1 className="dashboard-title">Revenue Sources</h1>
        <p className="dashboard-subtitle">Configure collection categories, source codes, and operational status.</p>
      </header>

      <div className="premium-panel p-4">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,auto]">
          <input
            className="premium-input"
            placeholder="Search by source name or code"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="premium-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select className="premium-input" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            className="premium-button-outline"
            onClick={() => {
              setSearch("");
              setCategory("");
              setStatus("all");
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="premium-panel p-4">
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sourceQuery.isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                      Loading revenue sources...
                    </td>
                  </tr>
                ) : sourceQuery.data?.rows.length ? (
                  sourceQuery.data.rows.map((source) => (
                  <tr
                    key={source.id}
                    onClick={() => setSelectedId(source.id)}
                    className={`cursor-pointer border-t border-[#e9decb] ${selectedId === source.id ? "bg-[#e7efe4]" : "hover:bg-[#f6f0e4]"}`}
                  >
                    <td className="px-3 py-2 text-slate-800">{source.name}</td>
                    <td className="px-3 py-2 text-slate-700">{source.code}</td>
                    <td className="px-3 py-2 text-slate-700">{source.category}</td>
                    <td className="px-3 py-2 text-slate-700">{source.isActive ? "active" : "inactive"}</td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                      No revenue sources found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="premium-panel p-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Create Source</h2>
            {createFeedback ? (
              <p className={`mb-3 text-sm ${createFeedback.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{createFeedback.message}</p>
            ) : null}
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canEdit) {
                  return;
                }
                setCreateFeedback(null);

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
              <input name="name" placeholder="Name" className="premium-input" disabled={!canEdit} required />
              <input name="code" placeholder="Code" className="premium-input" disabled={!canEdit} required />
              <select name="category" className="premium-input" disabled={!canEdit}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <textarea name="description" placeholder="Description" className="premium-input" disabled={!canEdit} rows={3} />
              <button className="premium-button w-full" disabled={!canEdit || createMutation.isPending} type="submit">
                {createMutation.isPending ? "Saving..." : "Create source"}
              </button>
            </form>
          </div>

          <div className="premium-panel p-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Update Selected</h2>
            {updateFeedback ? (
              <p className={`mb-3 text-sm ${updateFeedback.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{updateFeedback.message}</p>
            ) : null}
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
                  setUpdateFeedback(null);

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
                <input name="name" defaultValue={selectedSource.name} className="premium-input" disabled={!canEdit} />
                <input name="code" defaultValue={selectedSource.code} className="premium-input" disabled={!canEdit} />
                <select name="category" defaultValue={selectedSource.category} className="premium-input" disabled={!canEdit}>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <textarea name="description" defaultValue={selectedSource.description ?? ""} className="premium-input" disabled={!canEdit} rows={3} />
                <select name="isActive" defaultValue={selectedSource.isActive ? "true" : "false"} className="premium-input" disabled={!canEdit}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button className="premium-button-outline w-full" disabled={!canEdit || updateMutation.isPending} type="submit">
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
