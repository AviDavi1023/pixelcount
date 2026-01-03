"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CreatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timerMode: "countdown",
    startTime: "",
    endTime: "",
    duration: 300, // 5 minutes in seconds
    fillMode: "random",
    startColor: "#ffffff",
    endColor: "#000000",
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let startTime: Date;
      let endTime: Date;

      if (formData.timerMode === "countdown") {
        if (!formData.startTime || !formData.endTime) {
          setError("Please provide start and end times");
          setIsSubmitting(false);
          return;
        }
        startTime = new Date(formData.startTime);
        endTime = new Date(formData.endTime);

        if (endTime <= startTime) {
          setError("End time must be after start time");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Timer mode
        startTime = new Date();
        endTime = new Date(Date.now() + formData.duration * 1000);
      }

      const payload = {
        title: formData.title || "Untitled Timer",
        description: formData.description,
        timerMode: formData.timerMode,
        duration: formData.timerMode === "timer" ? formData.duration * 1000 : null,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        fillMode: formData.fillMode,
        startColor: formData.startColor,
        endColor: formData.endColor,
        isPublic: formData.isPublic,
      };

      const response = await fetch("/api/timers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create timer");
      }

      const timer = await response.json();
      router.push(`/timer/${timer.shareToken}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleDurationChange = (minutes: number, seconds: number) => {
    setFormData({ ...formData, duration: minutes * 60 + seconds });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            PixelCount
          </Link>
          <Link href="/" className="text-slate-300 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Create Timer</h1>
        <p className="text-slate-400 mb-8">Customize your countdown or timer</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!session && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <p className="text-yellow-400 text-sm font-medium mb-2">
                  Guest Mode - Timer won't be saved
                </p>
                <p className="text-yellow-300/80 text-xs mb-3">
                  Your timer will work, but won't be saved to your account or appear in the gallery.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-medium transition"
                >
                  Sign In to Save
                </Link>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., New Year Countdown"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about your timer..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Timer Mode */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, timerMode: "countdown" })}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  formData.timerMode === "countdown"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                }`}
              >
                Countdown
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, timerMode: "timer" })}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  formData.timerMode === "timer"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                }`}
              >
                Timer
              </button>
            </div>
          </div>

          {/* Countdown Inputs */}
          {formData.timerMode === "countdown" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          )}

          {/* Timer Duration */}
          {formData.timerMode === "timer" && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Duration</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={Math.floor(formData.duration / 60)}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0, formData.duration % 60)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <small className="text-slate-500 text-xs">Minutes</small>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.duration % 60}
                    onChange={(e) => handleDurationChange(Math.floor(formData.duration / 60), parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <small className="text-slate-500 text-xs">Seconds</small>
                </div>
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Start Color</label>
              <div className="relative h-14 rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-purple-500 transition">
                <input
                  type="color"
                  value={formData.startColor}
                  onChange={(e) => setFormData({ ...formData, startColor: e.target.value })}
                  className="absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">End Color</label>
              <div className="relative h-14 rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-purple-500 transition">
                <input
                  type="color"
                  value={formData.endColor}
                  onChange={(e) => setFormData({ ...formData, endColor: e.target.value })}
                  className="absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Fill Pattern */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Fill Pattern</label>
            <div className="grid grid-cols-3 gap-3">
              {["random", "linear", "solid"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData({ ...formData, fillMode: mode as any })}
                  className={`px-4 py-3 rounded-xl font-semibold capitalize transition ${
                    formData.fillMode === mode
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Public Toggle */}
          {session && (
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
              />
              <label htmlFor="isPublic" className="text-white font-medium cursor-pointer">
                Make this timer public (show in gallery)
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? "Creating..." : "Create Timer"}
          </button>
        </form>
      </main>
    </div>
  );
}
