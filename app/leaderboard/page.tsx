"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";

interface Timer {
  id: string;
  title: string;
  description: string | null;
  category: string;
  shareToken: string;
  viewCount: number;
  remixCount: number;
  likeCount: number;
  trendingScore: number;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  } | null;
}

export default function LeaderboardPage() {
  const [trendingTimers, setTrendingTimers] = useState<Timer[]>([]);
  const [popularTimers, setPopularTimers] = useState<Timer[]>([]);
  const [newTimers, setNewTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const [trendingRes, popularRes, newRes] = await Promise.all([
        fetch("/api/leaderboard?sort=trending&limit=10"),
        fetch("/api/leaderboard?sort=popular&limit=10"),
        fetch("/api/leaderboard?sort=new&limit=10"),
      ]);
      
      const [trending, popular, newest] = await Promise.all([
        trendingRes.json(),
        popularRes.json(),
        newRes.json(),
      ]);
      
      setTrendingTimers(trending.timers || []);
      setPopularTimers(popular.timers || []);
      setNewTimers(newest.timers || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimerList = (timers: Timer[], metric: "views" | "likes" | "trending") => (
    <div className="space-y-3">
      {timers.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No timers yet</p>
      ) : (
        timers.map((timer, index) => (
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
                <p className="text-slate-500 text-sm">
                  by {timer.user.username || timer.user.name || "Anonymous"}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                {metric === "views" && `${timer.viewCount} 👁`}
                {metric === "likes" && `${timer.likeCount} ❤️`}
                {metric === "trending" && `${Math.round(timer.trendingScore)} 🔥`}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-slate-400">Top timers from the community</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading leaderboard...</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Trending */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🔥</span> Trending Now
              </h2>
              {renderTimerList(trendingTimers, "trending")}
            </div>

            {/* Most Popular */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>👁</span> Most Viewed
              </h2>
              {renderTimerList(popularTimers, "views")}
            </div>

            {/* Recently Created */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>✨</span> Just Created
              </h2>
              {renderTimerList(newTimers, "views")}
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
