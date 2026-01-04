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

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
        shareToken={shareToken}
      />

      {/* Timer Info */}
      <div className="fixed top-32 left-1/2 -translate-x-1/2 z-20 px-6 py-2 rounded-xl bg-black/75 backdrop-blur-xl border border-white/20 max-w-2xl">
        <div className="text-center text-xs text-white/60">
          {timer.startTime && (
            <span>Started: {formatDateTime(startTime)} • </span>
          )}
          Ends: {formatDateTime(endTime)}
        </div>
      </div>

      {/* Back Button - Top Left */}
      <Link
        href="/gallery"
        className="fixed top-8 left-8 z-30 p-4 bg-black/75 backdrop-blur-xl rounded-full border border-white/20 hover:bg-black/90 transition"
        title="Back to Gallery"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>

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
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className="fixed top-24 right-8 z-40 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Customize View</h3>
            <button
              onClick={() => setShowCustomization(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
              title="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
        <div className="fixed top-24 right-8 z-40 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Share Timer</h3>
            <button
              onClick={() => setShowShareMenu(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
              title="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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

            <div className="pt-3 border-t border-slate-700">
              <p className="text-slate-400 text-xs mb-3">Share on social media</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(timer.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href={`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(timer.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  Reddit
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(timer.title + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(timer.title)}&body=${encodeURIComponent('Check out this timer: ' + window.location.href)}`}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>
            </div>
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
