"use client";

import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AwardIcon,
  CalendarIcon,
  FlameIcon,
  TrophyIcon,
  ZapIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TECH_MAP } from "@/data/tech";
import { LoaderCard } from "@/components/status/statusCard";
import { useAuthStore } from "@/store/authStore";
import { api, ProfileStats, GrowthDataPoint, SkillStat } from "@/services/api";
import { FollowListModal } from "@/components/social/FollowListModal";

const STAT_ICONS = [TrophyIcon, AwardIcon, FlameIcon, CalendarIcon];

export default function Profil() {
  const { user, login } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"followers" | "following">(
    "followers",
  );
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Haqiqiy API dan yuklanadigan ma'lumotlar
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [stats, growth, skillData] = await Promise.all([
          api.getProfileStats(),
          api.getGrowthData(),
          api.getSkillStats(),
        ]);
        setProfileStats(stats);
        setGrowthData(growth);
        setSkills(skillData);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile({ name: editName });
      // Update local user state
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          login(res, token);
        }
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const openModal = async (type: "followers" | "following") => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    try {
      if (!user?.username) return;
      const users =
        type === "followers"
          ? await api.getFollowers(user.username)
          : await api.getFollowing(user.username);
      setModalUsers(users);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const level = user.level || 1;
  const xpForNextLevel = level * 1000;
  const xp = user.totalXP || 0;
  const levelPct = Math.min(Math.round((xp / xpForNextLevel) * 100), 100);

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  // Haqiqiy statistikalarni kartochkalar uchun tayyorlash
  const statCards = [
    {
      id: "tests",
      label: "Yechilgan testlar",
      value: (
        user.completedQuizzes ??
        profileStats?.totalQuizzes ??
        0
      ).toString(),
    },
    {
      id: "accuracy",
      label: "O'rtacha aniqlik",
      value: profileStats ? `${profileStats.accuracy}%` : "—",
    },
    {
      id: "streak",
      label: "Kunlik seriya",
      value: (user.currentStreak ?? 0).toString(),
    },
    { id: "time", label: "Umumiy vaqt", value: profileStats?.totalTime || "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Hisob"
        title="Profilim"
        description="Yutuqlaringiz, o'sish dinamikangiz va ko'nikma darajangiz."
      />

      <section className="rounded-2xl border border-line bg-surface p-6 lg:p-7 relative">
        <button
          onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
          className="absolute top-6 right-6 p-2 rounded-xl border border-line bg-elevated hover:bg-line transition-colors text-ink-dim hover:text-ink"
        >
          {isEditing ? (
            <XIcon className="h-4 w-4" />
          ) : (
            <EditIcon className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-20 w-20 rounded-2xl object-cover border border-line"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-neon text-2xl font-extrabold text-bg">
              {initial}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-elevated border border-line rounded-lg px-3 py-1 text-ink focus:outline-none focus:border-neon transition-colors"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-neon text-bg p-1.5 rounded-lg hover:bg-neon-hover disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <h2 className="text-xl font-bold">{user.name}</h2>
              )}
              <span className="rounded-lg bg-neon/10 px-2.5 py-1 text-xs font-semibold text-neon">
                Level {level}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-dim">
              {user.email} • 2026-yildan beri
            </p>

            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => openModal("followers")}
                className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-ink">
                  {(user as any).followersCount || 0}
                </span>
                <span className="text-ink-dim">Kuzatuvchilar</span>
              </button>
              <button
                onClick={() => openModal("following")}
                className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-ink">
                  {(user as any).followingCount || 0}
                </span>
                <span className="text-ink-dim">Kuzatilayotganlar</span>
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <ZapIcon
                    className="h-3.5 w-3.5 text-neon"
                    aria-hidden="true"
                  />
                  {xp.toLocaleString("ru-RU")} /{" "}
                  {xpForNextLevel.toLocaleString("ru-RU")} XP
                </span>
                <span className="text-xs text-ink-dim">
                  Level {level + 1} gacha{" "}
                  {(xpForNextLevel - xp).toLocaleString("ru-RU")} XP
                </span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-elevated"
                role="progressbar"
                aria-valuenow={levelPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Level progressi"
              >
                <div
                  className="h-full rounded-full bg-neon transition-[width] duration-300 ease-out"
                  style={{ width: `${levelPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <div
              key={stat.id}
              className="flex flex-col rounded-2xl border border-line bg-surface p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-elevated text-ink-dim">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="mt-4 text-2xl font-bold tabular-nums">
                {loading && stat.id !== "tests" && stat.id !== "streak" ? (
                  <Loader2Icon className="h-5 w-5 animate-spin text-ink-dim" />
                ) : (
                  stat.value
                )}
              </span>
              <span className="mt-auto pt-1 text-sm text-ink-dim">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold">O'sish grafigi</h2>
            <span className="text-xs text-ink-muted">So'nggi 8 oy • XP</span>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="scale-75 origin-center">
                  <LoaderCard
                    illustrationSrc="/illustrations/loader-coding-boy.png"
                    title="Yuklanmoqda..."
                  />
                </div>
              </div>
            ) : growthData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-dim">
                Hali yetarli ma'lumot yo'q. Test yechib boshlang!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                >
                  <CartesianGrid
                    stroke="#30363D"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#6E7681"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6E7681"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ stroke: "#30363D" }}
                    contentStyle={{
                      backgroundColor: "#161B22",
                      border: "1px solid #30363D",
                      borderRadius: 12,
                      color: "#F0F6FC",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#8B949E" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    name="XP"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      fill: "#0B0F14",
                      stroke: "#10B981",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Aniqlik %"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 flex gap-5 text-xs text-ink-dim">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 rounded bg-neon" /> Oylik XP
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 rounded bg-info" /> Aniqlik %
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold">Texnologiyalar bo'yicha</h2>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="scale-75 origin-center">
                <LoaderCard
                  illustrationSrc="/illustrations/loader-coding-boy.png"
                  title="Yuklanmoqda..."
                />
              </div>
            </div>
          ) : skills.length === 0 ? (
            <p className="mt-5 text-sm text-ink-dim">
              Hali yetarli ma'lumot yo'q. Turli mavzularda test yechib boshlang!
            </p>
          ) : (
            <ul className="mt-5 space-y-5">
              {skills.map((skill) => {
                const tech = TECH_MAP[skill.tech as keyof typeof TECH_MAP] || {
                  color: "#10B981",
                  label: skill.tech,
                };
                return (
                  <li key={skill.tech}>
                    <div className="mb-2 flex items-baseline justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tech.color }}
                        />
                        {tech.label}
                      </span>
                      <span className="tabular-nums text-ink-dim">
                        {skill.value}%
                        <span className="ml-2 text-xs text-ink-muted">
                          {skill.solved} savol
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-elevated"
                      role="progressbar"
                      aria-valuenow={skill.value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${tech.label} darajasi`}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-300 ease-out"
                        style={{
                          width: `${skill.value}%`,
                          backgroundColor: tech.color,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <FollowListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === "followers" ? "Kuzatuvchilar" : "Kuzatilayotganlar"
        }
        users={modalUsers}
        loading={modalLoading}
      />
    </div>
  );
}
