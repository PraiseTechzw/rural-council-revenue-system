"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, listUsers, updateUser } from "@/api/users.api";
import { formatDateTime } from "@/lib/format";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "admin" | "finance_officer" | "collector">("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(roleFilter ? { roleName: roleFilter } : {}),
      ...(statusFilter ? { isActive: statusFilter === "true" } : {})
    }),
    [roleFilter, search, statusFilter]
  );

  const usersQuery = useQuery({
    queryKey: ["users", params],
    queryFn: () => listUsers(params)
  });

  const selectedUser = usersQuery.data?.rows.find((user) => user.id === selectedId) ?? null;

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateUser>[1] }) => updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  return (
    <section className="dashboard-page reveal">
      <header>
        <h1 className="dashboard-title">Users Management</h1>
        <p className="dashboard-subtitle">Create admin, finance, and collector users, then maintain role and access status.</p>
      </header>

      <div className="premium-panel grid gap-3 p-4 md:grid-cols-3">
        <input
          className="premium-input"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="premium-input" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="finance_officer">Finance Officer</option>
          <option value="collector">Collector</option>
        </select>
        <select className="premium-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="premium-panel p-4">
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : usersQuery.isError ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-rose-700">
                      Failed to load users.
                    </td>
                  </tr>
                ) : usersQuery.data?.rows.length ? (
                  usersQuery.data.rows.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedId(user.id)}
                      className={`cursor-pointer border-t border-[#e9decb] ${selectedId === user.id ? "bg-[#e7efe4]" : "hover:bg-[#f6f0e4]"}`}
                    >
                      <td className="px-3 py-2 text-slate-800">{user.firstName} {user.lastName}</td>
                      <td className="px-3 py-2 text-slate-700">{user.email}</td>
                      <td className="px-3 py-2 text-slate-700">{user.roleName}</td>
                      <td className="px-3 py-2 text-slate-700">{user.isActive ? "active" : "inactive"}</td>
                      <td className="px-3 py-2 text-slate-700">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "never"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="premium-panel p-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Create User</h2>
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await createMutation.mutateAsync({
                  firstName: String(formData.get("firstName") ?? ""),
                  lastName: String(formData.get("lastName") ?? ""),
                  email: String(formData.get("email") ?? ""),
                  phoneNumber: String(formData.get("phoneNumber") ?? "") || undefined,
                  password: String(formData.get("password") ?? ""),
                  roleName: String(formData.get("roleName") ?? "collector") as "admin" | "finance_officer" | "collector"
                });
                (event.currentTarget as HTMLFormElement).reset();
              }}
            >
              <input name="firstName" className="premium-input" placeholder="First name" required />
              <input name="lastName" className="premium-input" placeholder="Last name" required />
              <input name="email" type="email" className="premium-input" placeholder="Email" required />
              <input name="phoneNumber" className="premium-input" placeholder="Phone number (optional)" />
              <input name="password" type="password" minLength={8} className="premium-input" placeholder="Password (min 8 chars)" required />
              <select name="roleName" className="premium-input" defaultValue="collector">
                <option value="collector">Collector</option>
                <option value="finance_officer">Finance Officer</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="premium-button w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create user"}
              </button>
            </form>
          </div>

          <div className="premium-panel p-4">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Update Selected</h2>
            {!selectedUser ? (
              <p className="text-sm text-slate-500">Select a user from the table.</p>
            ) : (
              <form
                className="space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  await updateMutation.mutateAsync({
                    id: selectedUser.id,
                    payload: {
                      firstName: String(formData.get("firstName") ?? "") || undefined,
                      lastName: String(formData.get("lastName") ?? "") || undefined,
                      email: String(formData.get("email") ?? "") || undefined,
                      phoneNumber: String(formData.get("phoneNumber") ?? "") || null,
                      roleName: String(formData.get("roleName") ?? "") as "admin" | "finance_officer" | "collector",
                      isActive: String(formData.get("isActive")) === "true"
                    }
                  });
                }}
              >
                <input name="firstName" defaultValue={selectedUser.firstName} className="premium-input" />
                <input name="lastName" defaultValue={selectedUser.lastName} className="premium-input" />
                <input name="email" type="email" defaultValue={selectedUser.email} className="premium-input" />
                <input name="phoneNumber" defaultValue={selectedUser.phoneNumber ?? ""} className="premium-input" />
                <select name="roleName" defaultValue={selectedUser.roleName} className="premium-input">
                  <option value="collector">Collector</option>
                  <option value="finance_officer">Finance Officer</option>
                  <option value="admin">Admin</option>
                </select>
                <select name="isActive" defaultValue={selectedUser.isActive ? "true" : "false"} className="premium-input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button type="submit" className="premium-button-outline w-full" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update user"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}