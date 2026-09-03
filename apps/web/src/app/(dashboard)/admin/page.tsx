"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { LoaderCard } from "@/components/status/statusCard";
import {
  BanIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShieldIcon,
  CheckCircle2Icon,
  UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = async (search = "", targetPage = page) => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers(targetPage, 50, search);
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchTerm, page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    setPage(1);
    e.preventDefault();
    fetchUsers(searchTerm, 1);
  };

  const handleToggleBan = async (id: string, currentlyBanned: boolean) => {
    if (id === currentUser?._id) {
      alert("O'z-o'zingizni bloklay olmaysiz");
      return;
    }

    if (
      confirm(
        currentlyBanned
          ? "Blokdan chiqarilsinmi?"
          : "Haqiqatan ham bloklansinmi?",
      )
    ) {
      try {
        const updated = await api.toggleUserBan(id, !currentlyBanned);
        setUsers(
          users.map((u) =>
            u._id === id ? { ...u, isBanned: updated.isBanned } : u,
          ),
        );
      } catch (e) {
        console.error(e);
        alert("Xatolik yuz berdi");
      }
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    if (id === currentUser?._id) {
      alert(
        "O'z-o'zingizni adminlikdan ololmaysiz. Boshqa admin buni qilishi kerak.",
      );
      return;
    }

    const newRole = currentRole === "admin" ? "user" : "admin";
    if (confirm(`Rolni ${newRole} ga o'zgartirasizmi?`)) {
      try {
        const updated = await api.updateUserRole(id, newRole);
        setUsers(
          users.map((u) => (u._id === id ? { ...u, role: updated.role } : u)),
        );
      } catch (e: any) {
        console.error(e);
        alert(e.message || "Xatolik yuz berdi");
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-xl font-bold">Foydalanuvchilar</h2>
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Ism, email yoki username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-line bg-surface text-sm focus:border-neon outline-none transition-colors"
          />
        </form>
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoaderCard
              illustrationSrc="/illustrations/loader-astronaut.png"
              title="Foydalanuvchilar yuklanmoqda..."
            />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-ink-dim">
            Foydalanuvchilar topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-elevated border-b border-line text-ink-dim uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Statistika</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Rol</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => {
                  const rejectRate =
                    u.stats && u.stats.total > 0
                      ? u.stats.rejected / u.stats.total
                      : 0;
                  const isSpammer = rejectRate > 0.6 && u.stats?.total >= 3;
                  return (
                    <tr
                      key={u._id}
                      className={`transition-colors hover:bg-elevated/50 ${u.isBanned ? "bg-red-500/5" : ""} ${isSpammer && !u.isBanned ? "bg-orange-500/10" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt="avatar"
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-neon/10 text-neon flex items-center justify-center font-bold text-lg">
                                {u.name?.charAt(0)}
                              </div>
                            )}
                            {/* Online status indicator */}
                            <div
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${u.isOnline ? "bg-green-500" : "bg-ink-muted"}`}
                              title={u.isOnline ? "Online" : "Offline"}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{u.name}</p>
                            <p className="text-xs text-ink-dim">
                              @{u.username || "user"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-ink-dim">{u.email}</td>
                      <td className="px-6 py-4 text-center">
                        {u.stats ? (
                          <div className="text-xs flex flex-col gap-1 items-center">
                            <span className="text-ink-dim">
                              Yuborilgan: <b>{u.stats.total}</b>
                            </span>
                            {u.stats.total > 0 && (
                              <div className="flex gap-2">
                                <span className="text-green-500 bg-green-500/10 px-1.5 rounded">
                                  T: {u.stats.approved}
                                </span>
                                <span className="text-red-500 bg-red-500/10 px-1.5 rounded">
                                  R: {u.stats.rejected}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-dim text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-500">
                            <BanIcon className="w-3.5 h-3.5" />
                            Bloklangan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-500">
                            <CheckCircle2Icon className="w-3.5 h-3.5" />
                            Faol
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          disabled={u._id === currentUser?._id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.role === "admin" ? "bg-warning/10 text-warning hover:bg-warning/20" : "bg-elevated text-ink-dim hover:text-ink hover:bg-line"} ${u._id === currentUser?._id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {u.role === "admin" ? (
                            <ShieldCheckIcon className="w-4 h-4" />
                          ) : (
                            <UserIcon className="w-4 h-4" />
                          )}
                          {u.role === "admin" ? "Admin" : "User"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleBan(u._id, u.isBanned)}
                          disabled={
                            u._id === currentUser?._id || u.role === "admin"
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.isBanned ? "bg-ink text-surface hover:bg-ink-dim" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"} ${u._id === currentUser?._id || u.role === "admin" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {u.isBanned ? "Blokdan ochish" : "Bloklash"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
