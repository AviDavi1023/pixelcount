"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PixelTimer from "@/app/components/PixelTimer";
import Link from "next/link";

interface Timer {
  id: string;
  title: string;
  description: string | null;
  timerMode: string;
  startTime: string | null;
  endTime: string;
  fillMode: string;
  startColor: string;
  endColor: string;
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

export default function TimerViewPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;
  const [timer, setTimer] = useState<Timer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customStartColor, setCustomStartColor] = useState("");
  const [customEndColor, setCustomEndColor] = useState("");
  const [customFillMode, setCustomFillMode] = useState<"random" | "linear" | "solid">("random");
  const [showCustomization, setShowCustomization] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchTimer();
    checkLikeStatus();
  }, [shareToken]);

  const fetchTimer = async () => {
    try {
      const response = await fetch(`/api/timers/${shareToken}`);
      if (!response.ok) {
        throw new Error("Timer not found");
      }
      const data = await response.json();
      setTimer(data);
      setLikeCount(data._count.likes);
      setCustomStartColor(data.startColor);
      setCustomEndColor(data.endColor);
      setCustomFillMode(data.fillMode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/timers/${shareToken}/like`);
      const data = await response.json();
      setIsLiked(data.liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const toggleLike = async () => {
    try {
      const response = await fetch(`/api/timers/${shareToken}/like`, {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.href}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert("Embed code copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading timer...</div>
      </div>
    );
  }

  if (error || !timer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <h1 className="text-3xl font-bold text-white mb-2">Timer Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/gallery" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
            Browse Gallery
          </Link>
        </div>
      </div>
    );
  }

  const startTime = timer.startTime ? new Date(timer.startTime) : new Date();
  const endTime = new Date(timer.endTime);

  return (
    <>
      <PixelTimer
        startTime={startTime}
        endTime={endTime}
        startColor={customStartColor}
        endColor={customEndColor}
        fillMode={customFillMode}
        title={timer.title}
        showControls={true}
      />

      {/* Floating Action Buttons */}
      <div className="fixed top-8 right-8 z-30 flex flex-col gap-3">
        <button
          onClick={toggleLike}
          className={`p-4 backdrop-blur-xl rounded-full border transition ${
            isLiked
              ? "bg-red-500/80 border-red-400/50 hover:bg-red-600/80"
              : "bg-black/75 border-white/20 hover:bg-black/90"
          }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <div className="flex flex-col items-center gap-1">
            <svg
              className="w-6 h-6 text-white"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-xs text-white font-medium">{likeCount}</span>
          </div>
        </button>

        <button
          onClick={() => setShowCustomization(!showCustomization)}
          className="p-4 bg-black/75 backdrop-blur-xl rounded-full border border-white/20 hover:bg-black/90 transition"
          title="Customize"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="p-4 bg-black/75 backdrop-blur-xl rounded-full border border-white/20 hover:bg-black/90 transition"
          title="Share"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <Link
          href="/gallery"
          className="p-4 bg-black/75 backdrop-blur-xl rounded-full border border-white/20 hover:bg-black/90 transition"
          title="Back to Gallery"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className="fixed top-24 right-8 z-30 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h3 className="text-white font-bold mb-4">Customize View</h3>
          <p className="text-slate-400 text-sm mb-4">Changes only affect your view</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Start Color</label>
              <input
                type="color"
                value={customStartColor}
                onChange={(e) => setCustomStartColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">End Color</label>
              <input
                type="color"
                value={customEndColor}
                onChange={(e) => setCustomEndColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Fill Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(["random", "linear", "solid"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCustomFillMode(mode)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                      customFillMode === mode
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setCustomStartColor(timer.startColor);
                setCustomEndColor(timer.endColor);
                setCustomFillMode(timer.fillMode as any);
              }}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
            >
              Reset to Original
            </button>
          </div>
        </div>
      )}

      {/* Share Menu */}
      {showShareMenu && (
        <div className="fixed top-24 right-8 z-30 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h3 className="text-white font-bold mb-4">Share Timer</h3>

          <div className="space-y-3">
            <button
              onClick={copyShareLink}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </button>

            <button
              onClick={copyEmbedCode}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Copy Embed Code
            </button>
          </div>

          {timer.description && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm">{timer.description}</p>
            </div>
          )}

          {timer.user && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs">
                Created by <span className="text-slate-300">{timer.user.name || "Anonymous"}</span>
              </p>
              <p className="text-slate-600 text-xs mt-1">
                {timer.viewCount} views • {timer._count.likes} likes
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
