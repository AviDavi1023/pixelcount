"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Timer {
  id: string;
  title: string;
  description: string | null;
  endTime: string;
  fillMode: string;
  startColor: string;
  endColor: string;
  shareToken: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  _count: {
    likes: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserTimers();
    }
  }, [status]);

  const fetchUserTimers = async () => {
    try {
      // Get user ID first
      const userResponse = await fetch("/api/user");
      const userData = await userResponse.json();

      const response = await fetch(`/api/timers?userId=${userData.id}`);
      const data = await response.json();
      setTimers(data);
    } catch (error) {
      console.error("Error fetching timers:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTimer = async (shareToken: string) => {
    if (!confirm("Are you sure you want to delete this timer?")) return;

    try {
      const response = await fetch(`/api/timers/${shareToken}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTimers(timers.filter((t) => t.shareToken !== shareToken));
      }
    } catch (error) {
      console.error("Error deleting timer:", error);
      alert("Failed to delete timer");
    }
  };

  const togglePublic = async (timer: Timer) => {
    try {
      const response = await fetch(`/api/timers/${timer.shareToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !timer.isPublic }),
      });

      if (response.ok) {
        setTimers(
          timers.map((t) =>
            t.id === timer.id ? { ...t, isPublic: !t.isPublic } : t
          )
        );
      }
    } catch (error) {
      console.error("Error updating timer:", error);
      alert("Failed to update timer");
    }
  };

  const getTimeStatus = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    return end > now ? "Active" : "Completed";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            PixelCount
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/gallery" className="text-slate-300 hover:text-white transition">
              Gallery
            </Link>
            <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Create Timer
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{timers.length}</div>
            <div className="text-slate-400 text-sm">Total Timers</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {timers.filter((t) => t.isPublic).length}
            </div>
            <div className="text-slate-400 text-sm">Public Timers</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {timers.reduce((sum, t) => sum + t.viewCount, 0)}
            </div>
            <div className="text-slate-400 text-sm">Total Views</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {timers.reduce((sum, t) => sum + t._count.likes, 0)}
            </div>
            <div className="text-slate-400 text-sm">Total Likes</div>
          </div>
        </div>

        {/* Timers List */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">Your Timers</h2>
          </div>

          {timers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">⏱️</div>
              <p className="text-slate-400 mb-6">You haven't created any timers yet</p>
              <Link
                href="/create"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Create Your First Timer
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {timers.map((timer) => (
                <div key={timer.id} className="p-6 hover:bg-slate-800/20 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{timer.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            getTimeStatus(timer.endTime) === "Active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {getTimeStatus(timer.endTime)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            timer.isPublic
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {timer.isPublic ? "Public" : "Private"}
                        </span>
                      </div>

                      {timer.description && (
                        <p className="text-slate-400 text-sm mb-3">{timer.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="capitalize">{timer.fillMode}</span>
                        <span>👁 {timer.viewCount} views</span>
                        <span>❤️ {timer._count.likes} likes</span>
                        <span className="text-xs">
                          Created {new Date(timer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/timer/${timer.shareToken}`}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
                      >
                        View
                      </Link>
                      <Link
                        href={`/edit/${timer.shareToken}`}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublic(timer)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
                      >
                        {timer.isPublic ? "Make Private" : "Make Public"}
                      </button>
                      <button
                        onClick={() => deleteTimer(timer.shareToken)}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
