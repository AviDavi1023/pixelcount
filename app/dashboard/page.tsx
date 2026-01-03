"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PixelTimerThumbnail from "@/app/components/PixelTimerThumbnail";

interface Timer {
  id: string;
  title: string;
  description: string | null;
  timerMode: string;
  endTime: string;
  fillMode: string;
  startColor: string;
  endColor: string;
  shareToken: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  duration: number | null;
  _count: {
    likes: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimers, setSelectedTimers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  const duplicateTimer = async (timer: Timer) => {
    if (!confirm("Create a copy of this timer with a new end time?")) return;

    try {
      // Calculate new end time (use duration if available, otherwise estimate from end time)
      const originalDuration = timer.duration || (new Date(timer.endTime).getTime() - new Date(timer.createdAt).getTime());
      const newStartTime = new Date();
      const newEndTime = new Date(newStartTime.getTime() + originalDuration);

      const response = await fetch("/api/timers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${timer.title} (Copy)`,
          description: timer.description,
          timerMode: timer.timerMode,
          duration: originalDuration,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          fillMode: timer.fillMode,
          startColor: timer.startColor,
          endColor: timer.endColor,
          isPublic: false, // Start as private
        }),
      });

      if (response.ok) {
        const newTimer = await response.json();
        alert("Timer duplicated successfully!");
        fetchUserTimers(); // Refresh list
      }
    } catch (error) {
      console.error("Error duplicating timer:", error);
      alert("Failed to duplicate timer");
    }
  };

  const getTimeStatus = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    return end > now ? "Active" : "Completed";
  };

  const toggleTimerSelection = (timerId: string) => {
    const newSelected = new Set(selectedTimers);
    if (newSelected.has(timerId)) {
      newSelected.delete(timerId);
    } else {
      newSelected.add(timerId);
    }
    setSelectedTimers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTimers.size === timers.length) {
      setSelectedTimers(new Set());
    } else {
      setSelectedTimers(new Set(timers.map((t) => t.id)));
    }
  };

  const deleteSelectedTimers = async () => {
    if (!confirm(`Delete ${selectedTimers.size} timer(s)? This cannot be undone.`)) return;

    try {
      for (const timerId of selectedTimers) {
        const timer = timers.find((t) => t.id === timerId);
        if (timer) {
          await fetch(`/api/timers/${timer.shareToken}`, { method: "DELETE" });
        }
      }
      setTimers(timers.filter((t) => !selectedTimers.has(t.id)));
      setSelectedTimers(new Set());
    } catch (error) {
      console.error("Error deleting timers:", error);
      alert("Failed to delete some timers");
    }
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Timers</h2>
              {timers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 rounded-lg transition text-sm ${
                      viewMode === "list"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 rounded-lg transition text-sm ${
                      viewMode === "grid"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Grid View
                  </button>
                </div>
              )}
            </div>
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
            <>
              {/* Multi-select controls */}
              {timers.length > 0 && (
                <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedTimers.size === timers.length && timers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <span className="text-sm text-slate-400">
                      {selectedTimers.size > 0 ? `${selectedTimers.size} selected` : "Select all"}
                    </span>
                  </div>
                  {selectedTimers.size > 0 && (
                    <button
                      onClick={deleteSelectedTimers}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
                    >
                      Delete Selected ({selectedTimers.size})
                    </button>
                  )}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="divide-y divide-slate-700">
                  {timers.map((timer) => (
                    <div key={timer.id} className="p-6 hover:bg-slate-800/20 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTimers.has(timer.id)}
                            onChange={() => toggleTimerSelection(timer.id)}
                            className="w-5 h-5 rounded cursor-pointer mt-1"
                          />
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
                        </div>

                        <div className="flex gap-2 flex-wrap">
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
                            onClick={() => duplicateTimer(timer)}
                            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition text-sm"
                            title="Duplicate timer"
                          >
                            Copy
                          </button>
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

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {timers.map((timer) => (
                    <div
                      key={timer.id}
                      className={`bg-slate-800/50 border rounded-xl overflow-hidden transition cursor-pointer ${
                        selectedTimers.has(timer.id)
                          ? "border-purple-500 ring-2 ring-purple-500/50"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                      onClick={() => toggleTimerSelection(timer.id)}
                    >
                      {/* Checkbox */}
                      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/80">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedTimers.has(timer.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTimerSelection(timer.id);
                            }}
                            className="w-5 h-5 rounded cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <h3 className="font-bold text-white truncate">{timer.title}</h3>
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div className="h-40 bg-slate-700/50 relative overflow-hidden">
                        <PixelTimerThumbnail
                          startTime={new Date(timer.createdAt)}
                          endTime={new Date(timer.endTime)}
                          startColor={timer.startColor}
                          endColor={timer.endColor}
                          fillMode={timer.fillMode as "random" | "linear" | "solid"}
                          width={300}
                          height={160}
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex gap-2 flex-wrap">
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
                          <p className="text-slate-400 text-sm line-clamp-2">{timer.description}</p>
                        )}

                        <div className="text-xs text-slate-500">
                          <div>👁 {timer.viewCount} • ❤️ {timer._count.likes}</div>
                          <div className="capitalize">{timer.fillMode}</div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link
                            href={`/timer/${timer.shareToken}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition text-center"
                          >
                            View
                          </Link>
                          <Link
                            href={`/edit/${timer.shareToken}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition text-center"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
