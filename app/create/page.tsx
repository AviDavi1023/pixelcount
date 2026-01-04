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
  const [showTemplates, setShowTemplates] = useState(true);

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
    isRecurring: false,
    recurrenceType: "daily",
  });

  // Timer Templates
  const templates = [
    {
      name: "Daily Reset",
      description: "Resets every day at midnight",
      icon: "🌅",
      data: {
        title: "Daily Countdown",
        timerMode: "countdown",
        isRecurring: true,
        recurrenceType: "daily",
        fillMode: "random",
        startColor: "#1e293b",
        endColor: "#8b5cf6",
      },
    },
    {
      name: "Work Sprint",
      description: "25-minute Pomodoro timer",
      icon: "💼",
      data: {
        title: "Work Sprint",
        timerMode: "timer",
        duration: 1500,
        fillMode: "linear",
        startColor: "#1e293b",
        endColor: "#ec4899",
      },
    },
    {
      name: "New Year",
      description: "Countdown to next year",
      icon: "🎉",
      data: {
        title: "New Year Countdown",
        timerMode: "countdown",
        isRecurring: true,
        recurrenceType: "yearly",
        fillMode: "random",
        startColor: "#1e293b",
        endColor: "#06b6d4",
      },
    },
    {
      name: "Birthday",
      description: "Countdown to birthday",
      icon: "🎂",
      data: {
        title: "Birthday Countdown",
        timerMode: "countdown",
        fillMode: "spiral",
        startColor: "#fbbf24",
        endColor: "#ec4899",
      },
    },
  ];

  // Color Themes
  const colorThemes = [
    { name: "Ocean", start: "#1e3a8a", end: "#06b6d4" },
    { name: "Sunset", start: "#fbbf24", end: "#dc2626" },
    { name: "Forest", start: "#14532d", end: "#84cc16" },
    { name: "Purple", start: "#1e293b", end: "#8b5cf6" },
    { name: "Pink", start: "#1e293b", end: "#ec4899" },
    { name: "Matrix", start: "#000000", end: "#10b981" },
    { name: "Fire", start: "#7c2d12", end: "#fbbf24" },
    { name: "Ice", start: "#dbeafe", end: "#1e40af" },
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    const now = new Date();
    let startTime = "";
    let endTime = "";

    if (template.data.timerMode === "countdown") {
      if (template.data.recurrenceType === "daily") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        startTime = start.toISOString().slice(0, 16);
        endTime = end.toISOString().slice(0, 16);
      } else if (template.data.recurrenceType === "yearly") {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        startTime = start.toISOString().slice(0, 16);
        endTime = end.toISOString().slice(0, 16);
      }
    }

    setFormData({
      ...formData,
      ...template.data,
      startTime,
      endTime,
    });
    setShowTemplates(false);
  };

  const applyColorTheme = (theme: typeof colorThemes[0]) => {
    setFormData({
      ...formData,
      startColor: theme.start,
      endColor: theme.end,
    });
  };

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
        isRecurring: formData.isRecurring,
        recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
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

        {/* Templates Section */}
        {showTemplates && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Quick Start Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-slate-400 hover:text-white text-sm transition"
              >
                Skip →
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  className="text-left p-4 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-purple-500 hover:bg-slate-800/50 transition group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1 group-hover:text-purple-400 transition">
                        {template.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
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
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Colors</label>
            
            {/* Color Themes */}
            <div className="mb-3 flex flex-wrap gap-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => applyColorTheme(theme)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/50 border border-slate-700 hover:border-purple-500 transition flex items-center gap-2"
                  title={theme.name}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.start }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.end }}></div>
                  </div>
                  <span className="text-slate-300">{theme.name}</span>
                </button>
              ))}
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Color</label>
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
                <label className="block text-xs text-slate-400 mb-1">End Color</label>
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
          </div>

          {/* Fill Pattern */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">Fill Pattern</label>
            <div className="grid grid-cols-3 gap-3">
              {["random", "linear", "solid", "spiral", "wave", "checkerboard", "centerOut", "cornersIn"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData({ ...formData, fillMode: mode as any })}
                  className={`px-4 py-3 rounded-xl font-semibold capitalize transition text-sm ${
                    formData.fillMode === mode
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                  }`}
                >
                  {mode === "centerOut" ? "Center Out" : mode === "cornersIn" ? "Corners In" : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Timer Option */}
          {formData.timerMode === "countdown" && session && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                />
                <label htmlFor="isRecurring" className="text-white font-medium cursor-pointer">
                  Make this timer recurring
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Recurrence Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["daily", "weekly", "monthly", "yearly"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, recurrenceType: type as any })}
                        className={`px-3 py-2 rounded-lg font-medium capitalize transition text-sm ${
                          formData.recurrenceType === type
                            ? "bg-purple-600 text-white"
                            : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
