"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PixelTimerThumbnail from "@/app/components/PixelTimerThumbnail";

interface Timer {
  id: string;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string;
  fillMode: string;
  startColor: string;
  endColor: string;
  shareToken: string;
  viewCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  } | null;
  _count: {
    likes: number;
  };
}

export default function GalleryPage() {
  const { data: session } = useSession();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    fetchTimers();
  }, [search, sortBy]);

  const fetchTimers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("sortBy", sortBy);

      const response = await fetch(`/api/timers?${params}`);
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setTimers(data);
      } else {
        console.error("API returned non-array data:", data);
        setTimers([]);
      }
    } catch (error) {
      console.error("Error fetching timers:", error);
      setTimers([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return "Completed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isCompleted = (endTime: string) => {
    return new Date(endTime).getTime() < new Date().getTime();
  };

  const isExampleTimer = (shareToken: string) => {
    return shareToken.includes('example') || shareToken.includes('countdown');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            PixelCount
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Create Timer
            </Link>
            {session ? (
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-slate-300 hover:text-white transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Timer Gallery</h1>
          <p className="text-slate-400">Discover timers created by the community</p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search timers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="createdAt">Newest First</option>
            <option value="title">Alphabetical</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {/* Timers Grid */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading timers...</div>
        ) : timers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No timers found</p>
            <Link href="/create" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Create the First One
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timers.map((timer) => (
              <Link
                key={timer.id}
                href={`/timer/${timer.shareToken}`}
                className="block bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:border-purple-500 hover:bg-slate-800/50 transition group relative"
              >
                {/* Pin Icon for Example Timers */}
                {isExampleTimer(timer.shareToken) && (
                  <div className="absolute top-4 right-4 z-10 bg-yellow-500/20 backdrop-blur-sm rounded-full p-2 border border-yellow-500/30">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                  </div>
                )}

                {/* Completed Banner */}
                {isCompleted(timer.endTime) && (
                  <div className="absolute top-4 left-4 z-10 bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-green-500/30">
                    <span className="text-green-400 text-xs font-semibold">✓ COMPLETED</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition">
                      {timer.title}
                    </h3>
                    {timer.description && (
                      <p className="text-slate-400 text-sm line-clamp-2">{timer.description}</p>
                    )}
                  </div>
                </div>

                {/* Timer Thumbnail */}
                <div className="rounded-lg mb-4 overflow-hidden bg-slate-800/50 border border-slate-700 h-40">
                  <PixelTimerThumbnail
                    startTime={timer.startTime ? new Date(timer.startTime) : new Date(timer.endTime)}
                    endTime={new Date(timer.endTime)}
                    startColor={timer.startColor}
                    endColor={timer.endColor}
                    fillMode={timer.fillMode as "random" | "linear" | "solid"}
                    width={300}
                    height={160}
                  />
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-400">
                    <span className="capitalize">{timer.fillMode}</span> • {getTimeRemaining(timer.endTime)}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>👁 {timer.viewCount}</span>
                    <span>❤️ {timer._count.likes}</span>
                  </div>
                </div>

                {/* Creator */}
                {timer.user && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                      by <span className="text-slate-400">{timer.user.name || "Anonymous"}</span>
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
