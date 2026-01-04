"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import PixelTimerThumbnail from "@/app/components/PixelTimerThumbnail";

export default function Home() {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);
  const [exampleTimers, setExampleTimers] = useState<any[]>([]);

  useEffect(() => {
    fetchExampleTimers();
  }, []);

  const fetchExampleTimers = async () => {
    try {
      const response = await fetch("/api/timers?sortBy=createdAt");
      const data = await response.json();
      // Filter for example timers
      const examples = data.filter((t: any) =>
        t.shareToken.includes("example") || 
        t.shareToken.includes("daily-countdown") ||
        t.shareToken.includes("monthly-countdown") ||
        t.shareToken.includes("yearly-countdown")
      ).slice(0, 3);
      setExampleTimers(examples);
    } catch (error) {
      console.error("Error fetching example timers:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            PixelCount
          </Link>
          
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/gallery" className="text-slate-300 hover:text-white transition">
              Gallery
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
                  Create Timer
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setShowNav(!showNav)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showNav && (
          <div className="md:hidden border-t border-slate-800 px-4 py-4 flex flex-col gap-3">
            <Link href="/gallery" className="text-slate-300 hover:text-white transition">
              Gallery
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/create" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-center">
                  Create Timer
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

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
