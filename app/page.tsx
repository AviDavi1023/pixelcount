"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import PixelTimerThumbnail from "@/app/components/PixelTimerThumbnail";

export default function Home() {
  const [exampleTimers, setExampleTimers] = useState<any[]>([]);

  useEffect(() => {
    regenerateExampleTimers();
    fetchExampleTimers();
  }, []);

  const adjustTimerForTimezone = (timerData: any) => {
    const now = new Date();
    
    if (timerData.shareToken === "daily-countdown-example") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { ...timerData, startTime: startOfDay.toISOString(), endTime: endOfDay.toISOString() };
    }
    
    if (timerData.shareToken === "monthly-countdown-example") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { ...timerData, startTime: startOfMonth.toISOString(), endTime: endOfMonth.toISOString() };
    }
    
    if (timerData.shareToken === "yearly-countdown-example") {
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { ...timerData, startTime: startOfYear.toISOString(), endTime: endOfYear.toISOString() };
    }
    
    return timerData;
  };

  const regenerateExampleTimers = async () => {
    try {
      await fetch("/api/timers/regenerate-examples", { method: "POST" });
    } catch (error) {
      console.error("Error regenerating example timers:", error);
    }
  };

  const fetchExampleTimers = async () => {
    try {
      const response = await fetch("/api/timers?sortBy=createdAt");
      const data = await response.json();
      // Handle both old array format and new pagination format
      const timersArray = Array.isArray(data) ? data : data.timers || [];
      // Filter for example timers
      const examples = timersArray.filter((t: any) =>
        t.shareToken.includes("example") || 
        t.shareToken.includes("daily-countdown") ||
        t.shareToken.includes("monthly-countdown") ||
        t.shareToken.includes("yearly-countdown")
      ).slice(0, 3);
      // Adjust times for user's timezone
      const adjustedExamples = examples.map(adjustTimerForTimezone);
      setExampleTimers(adjustedExamples);
    } catch (error) {
      console.error("Error fetching example timers:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Visual Countdowns & Timers
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Create stunning pixel-filling timers and countdowns. Share them with the world or keep them private. Customize colors, patterns, and modes to fit your needs.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/create"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition transform hover:scale-105"
          >
            Create Timer
          </Link>
          <Link
            href="/gallery"
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition transform hover:scale-105"
          >
            Browse Gallery
          </Link>
        </div>

        {/* Example Timers */}
        {exampleTimers.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-white">Example Timers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {exampleTimers.map((timer) => (
                <Link
                  key={timer.id}
                  href={`/timer/${timer.shareToken}`}
                  className="block bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500 hover:bg-slate-800/50 transition group"
                >
                  <div className="h-40 bg-slate-700/50 relative overflow-hidden">
                    <PixelTimerThumbnail
                      startTime={timer.startTime ? new Date(timer.startTime) : new Date(timer.endTime)}
                      endTime={new Date(timer.endTime)}
                      startColor={timer.startColor}
                      endColor={timer.endColor}
                      fillMode={timer.fillMode as "random" | "linear" | "solid"}
                      width={300}
                      height={160}
                      shareToken={timer.shareToken}
                      enableCycling={true}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition">
                      {timer.title}
                    </h3>
                    {timer.description && (
                      <p className="text-slate-400 text-sm">{timer.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Customizable</h3>
            <p className="text-slate-400">Choose from multiple fill patterns and custom color gradients.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Shareable</h3>
            <p className="text-slate-400">Share timers via link, embed them, or share on social media.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">Social</h3>
            <p className="text-slate-400">Discover timers from others in our community gallery.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
