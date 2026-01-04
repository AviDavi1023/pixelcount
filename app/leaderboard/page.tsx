"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Timer {
  id: string;
  title: string;
  shareToken: string;
  viewCount: number;
  user: {
    id: string;
    name: string | null;
  } | null;
  _count: {
    likes: number;
  };
}

interface LeaderboardData {
  mostViewedWeek: Timer[];
  mostLikedMonth: Timer[];
  allTimeViewed: Timer[];
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimerList = (timers: Timer[], metric: "views" | "likes") => (
    <div className="space-y-3">
      {timers.map((timer, index) => (
        <Link
          key={timer.id}
          href={`/timer/${timer.shareToken}`}
          className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-purple-500 hover:bg-slate-800/50 transition group"
        >
          <div className={`text-2xl font-bold ${
            index === 0 ? "text-yellow-400" :
            index === 1 ? "text-slate-300" :
            index === 2 ? "text-amber-600" :
            "text-slate-500"
          }`}>
            #{index + 1}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold group-hover:text-purple-400 transition">
              {timer.title}
            </h3>
            {timer.user && (
              <p className="text-slate-500 text-sm">by {timer.user.name || "Anonymous"}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-white font-bold">
              {metric === "views" ? `${timer.viewCount} 👁` : `${timer._count.likes} ❤️`}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

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
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-slate-400">Top timers from the community</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading leaderboard...</div>
        ) : !data ? (
          <div className="text-center text-slate-400 py-12">Failed to load leaderboard</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Most Viewed This Week */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>👁</span> Most Viewed This Week
              </h2>
              {renderTimerList(data.mostViewedWeek, "views")}
            </div>

            {/* Most Liked This Month */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>❤️</span> Most Liked This Month
              </h2>
              {renderTimerList(data.mostLikedMonth, "likes")}
            </div>

            {/* All-Time Most Viewed */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🔥</span> All-Time Most Viewed
              </h2>
              {renderTimerList(data.allTimeViewed, "views")}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">Create Your Own Timer</h3>
          <p className="text-slate-300 mb-6">Join the community and compete for the top spots!</p>
          <Link
            href="/create"
            className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition transform hover:scale-105"
          >
            Create Timer
          </Link>
        </div>
      </main>
    </div>
  );
}
