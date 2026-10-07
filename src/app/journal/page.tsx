"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  entryDate: string;
  mood: string | null;
};

const moods = [
  "Happy",
  "Excited",
  "Peaceful",
  "Grateful",
  "Neutral",
  "Sad",
];

export default function JournalPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  async function fetchEntries() {
    try {
      const response = await fetch("/api/journal", {
      method: "GET",
      credentials: "same-origin",
    });
      const data = await response.json();
    //   console.log("Journal API status:", response.status);
    // console.log("Journal API response:", data);
      if (!response.ok) {
        throw new Error("Failed to fetch memories");
      }

      

      setEntries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
  async function checkAuthentication() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      fetchEntries();
    } catch (error) {
      console.error("Authentication check failed:", error);
      router.push("/login");
    }
  }

  checkAuthentication();
}, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          mood,
          entryDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save memory");
      }

      const newEntry = await response.json();

      setEntries((current) => [newEntry, ...current]);

      setTitle("");
      setContent("");
      setMood("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between gap-6">
  <div>
    <p className="mb-2 text-sm font-medium text-zinc-500">
      LifeStory
    </p>

    <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
      Capture your day.
    </h1>

    <p className="mt-3 text-zinc-600">
      Your life is already a story. Just capture the moments.
    </p>
  </div>

  <button
    type="button"
    onClick={handleLogout}
    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
  >
    Logout
  </button>
</div>
        {/* Journal Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Title
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give this memory a title..."
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-zinc-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              What happened today?
            </label>

            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write whatever you want to remember..."
              rows={7}
              className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-zinc-500"
            />
          </div>

          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-zinc-700">
              How were you feeling?
            </p>

            <div className="flex flex-wrap gap-2">
              {moods.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMood(item)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    mood === item
                      ? "border-black bg-black text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Memory"}
          </button>
        </form>

        {/* Memories */}
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-semibold text-zinc-900">
            Your memories
          </h2>

          {fetching ? (
            <p className="text-zinc-500">Loading memories...</p>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="font-medium text-zinc-800">
                Your story starts here.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Write your first memory above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {entry.title || "Untitled memory"}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(entry.entryDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {entry.mood && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                        {entry.mood}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-600">
                    {entry.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}