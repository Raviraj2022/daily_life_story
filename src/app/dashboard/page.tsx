"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  entryDate: string;
  mood: string | null;
};

type User = {
  id: string;
  email: string;
};

const moodEmoji: Record<string, string> = {
  Happy: "😊",
  Excited: "⚡",
  Peaceful: "🌿",
  Grateful: "🙏",
  Neutral: "😌",
  Sad: "🌧️",
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authResponse = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });

        if (!authResponse.ok) {
          router.replace("/login");
          return;
        }

        const authData = await authResponse.json();

        setUser(authData.user);

        const journalResponse = await fetch("/api/journal", {
          credentials: "same-origin",
        });

        if (!journalResponse.ok) {
          throw new Error("Failed to load memories");
        }

        const journalData = await journalResponse.json();

        setEntries(journalData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  const currentYear = new Date().getFullYear();

  const memoriesThisYear = useMemo(() => {
    return entries.filter(
      (entry) =>
        new Date(entry.entryDate).getFullYear() === currentYear
    ).length;
  }, [entries, currentYear]);

  const memoriesThisMonth = useMemo(() => {
    const now = new Date();

    return entries.filter((entry) => {
      const date = new Date(entry.entryDate);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  }, [entries]);

  const recentEntries = entries.slice(0, 4);

  const firstName =
    user?.email?.split("@")[0]?.split(".")[0] || "there";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <p className="text-sm text-zinc-500">
            Loading your story...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-zinc-900">
      <div className="flex min-h-screen">

        {/* =========================================
            SIDEBAR
        ========================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">

          {/* Logo */}
          <div className="px-7 py-7">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <span className="text-sm font-semibold">L</span>
              </div>

              <span className="text-lg font-semibold tracking-tight">
                LifeStory
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">

            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Your story
            </p>

            <button
              className="mb-1 flex w-full items-center gap-3 rounded-xl bg-zinc-100 px-3 py-3 text-sm font-medium text-zinc-900"
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              onClick={() => router.push("/journal")}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>✎</span>
              Journal
            </button>

            <button
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>◷</span>
              Timeline
            </button>

            <button
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>✦</span>
              Stories
            </button>

            <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Memories
            </p>

            <button
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>♧</span>
              People
            </button>

            <button
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>⌖</span>
              Places
            </button>

            <button
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>▣</span>
              Photos
            </button>
          </nav>

          {/* Bottom */}
          <div className="border-t border-zinc-200 p-4">

            <div className="mb-3 rounded-xl bg-zinc-50 p-3">
              <p className="truncate text-xs font-medium text-zinc-800">
                {user?.email}
              </p>

              <p className="mt-1 text-[11px] text-zinc-400">
                Personal account
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <span>↪</span>
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </aside>

        {/* =========================================
            MAIN CONTENT
        ========================================== */}

        <div className="min-w-0 flex-1">

          {/* Mobile Header */}
          <header className="border-b border-zinc-200 bg-white px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between">

              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
                  L
                </div>

                <span className="font-semibold">
                  LifeStory
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="text-sm text-zinc-500"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

            {/* =====================================
                WELCOME
            ====================================== */}

            <section className="mb-10">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-400">
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>

                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    Good morning,{" "}
                    <span className="text-zinc-400">
                      {firstName}.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-7 text-zinc-500">
                    Your life is made of little moments.
                    Keep capturing them — one day they will become
                    your story.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/journal")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700"
                >
                  <span className="text-lg">+</span>
                  Write a memory
                </button>

              </div>
            </section>

            {/* =====================================
                STATS
            ====================================== */}

            <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* Total */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Total memories
                    </p>

                    <p className="mt-3 text-4xl font-semibold tracking-tight">
                      {entries.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    ✎
                  </div>
                </div>

                <p className="mt-5 text-xs text-zinc-400">
                  Moments captured so far
                </p>
              </div>

              {/* Year */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      This year
                    </p>

                    <p className="mt-3 text-4xl font-semibold tracking-tight">
                      {memoriesThisYear}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    ◷
                  </div>
                </div>

                <p className="mt-5 text-xs text-zinc-400">
                  Memories in {currentYear}
                </p>
              </div>

              {/* Month */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      This month
                    </p>

                    <p className="mt-3 text-4xl font-semibold tracking-tight">
                      {memoriesThisMonth}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    ✦
                  </div>
                </div>

                <p className="mt-5 text-xs text-zinc-400">
                  Memories captured recently
                </p>
              </div>

              {/* Stories */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Life stories
                    </p>

                    <p className="mt-3 text-4xl font-semibold tracking-tight">
                      0
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    ✧
                  </div>
                </div>

                <p className="mt-5 text-xs text-zinc-400">
                  AI stories coming soon
                </p>
              </div>

            </section>

            {/* =====================================
                FEATURE + RECENT
            ====================================== */}

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

              {/* Write CTA */}
              <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white sm:p-10">

                <div className="relative z-10">

                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-zinc-300">
                    Your daily ritual
                  </span>

                  <h2 className="mt-6 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
                    What happened today?
                  </h2>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">
                    A conversation, a new place, a difficult day,
                    a small win — nothing is too ordinary to remember.
                  </p>

                  <button
                    onClick={() => router.push("/journal")}
                    className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
                  >
                    Capture today's moment →
                  </button>

                </div>

                {/* Decorative circles */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
                <div className="absolute -bottom-32 right-10 h-72 w-72 rounded-full border border-white/5" />

              </div>

              {/* Story Preview */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-8">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Your story
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      Life in words
                    </h2>
                  </div>

                  <span className="text-2xl">✦</span>

                </div>

                <div className="mt-8 rounded-2xl bg-[#f7f6f2] p-6">

                  <p className="text-sm leading-7 text-zinc-600">
                    Soon, LifeStory will turn your memories into
                    meaningful stories — daily, weekly, monthly,
                    and yearly.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs text-zinc-500">
                      Daily
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs text-zinc-500">
                      Weekly
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs text-zinc-500">
                      Monthly
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs text-zinc-500">
                      Yearly
                    </span>
                  </div>

                </div>

                <button
                  disabled
                  className="mt-5 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-400"
                >
                  Generate a story — coming soon
                </button>

              </div>

            </section>

            {/* =====================================
                RECENT MEMORIES
            ====================================== */}

            <section className="mt-12">

              <div className="mb-6 flex items-end justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Your memories
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Recently captured
                  </h2>
                </div>

                {entries.length > 0 && (
                  <button
                    onClick={() => router.push("/journal")}
                    className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
                  >
                    View all →
                  </button>
                )}

              </div>

              {recentEntries.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-xl">
                    ✎
                  </div>

                  <h3 className="mt-5 font-semibold">
                    Your story starts here
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Your first memory doesn't have to be special.
                    Just start writing. The story will grow with you.
                  </p>

                  <button
                    onClick={() => router.push("/journal")}
                    className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
                  >
                    Write your first memory
                  </button>

                </div>

              ) : (

                <div className="grid gap-4 md:grid-cols-2">

                  {recentEntries.map((entry) => (

                    <article
                      key={entry.id}
                      className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-xs text-zinc-400">
                            {new Date(
                              entry.entryDate
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>

                          <h3 className="mt-2 truncate font-semibold">
                            {entry.title || "Untitled memory"}
                          </h3>

                        </div>

                        {entry.mood && (
                          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600">
                            {moodEmoji[entry.mood] || "•"}{" "}
                            {entry.mood}
                          </span>
                        )}

                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                        {entry.content}
                      </p>

                      <div className="mt-5 border-t border-zinc-100 pt-4">

                        <button
                          onClick={() => router.push("/journal")}
                          className="text-xs font-medium text-zinc-400 transition group-hover:text-zinc-900"
                        >
                          Read memory →
                        </button>

                      </div>

                    </article>

                  ))}

                </div>

              )}

            </section>

            {/* Footer */}
            <footer className="mt-16 border-t border-zinc-200 py-8 text-center">
              <p className="text-xs text-zinc-400">
                LifeStory · Your life is already a story.
              </p>
            </footer>

          </div>
        </div>
      </div>
    </main>
  );
}