"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "./Confetti";

interface PixelTimerProps {
  startTime: Date;
  endTime: Date;
  startColor: string;
  endColor: string;
  fillMode: "random" | "linear" | "solid" | "checkerboard";
  title?: string;
  showControls?: boolean;
}

export default function PixelTimer({
  startTime,
  endTime,
  startColor,
  endColor,
  fillMode,
  title,
  showControls = true,
}: PixelTimerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [rate, setRate] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const pixelOrderRef = useRef<Uint32Array | undefined>(undefined);
  const imageDataRef = useRef<ImageData | undefined>(undefined);
  const filledPixelsRef = useRef(0);
  const seedRef = useRef<string>("");

  const hexToRGB = (hex: string) => {
    const num = parseInt(hex.slice(1), 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  // Initialize canvas on mount and window resize
  useEffect(() => {
    initializeCanvas(true);
    
    const handleResize = () => {
      // On resize, regenerate pixel order but preserve progress based on elapsed time
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          // Get current progress before resizing
          const now = Date.now();
          const start = startTime.getTime();
          const end = endTime.getTime();
          const currentProgress = Math.min(1, Math.max(0, (now - start) / (end - start)));
          
          // Update canvas dimensions
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          
          // Reinitialize with new dimensions
          initializeCanvas(true);
          
          // Restore progress based on elapsed time, not pixels
          const totalPixels = canvas.width * canvas.height;
          const targetPixels = Math.floor(currentProgress * totalPixels);
          filledPixelsRef.current = targetPixels;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [startTime, endTime]);

  const interpolateColor = (start: ReturnType<typeof hexToRGB>, end: ReturnType<typeof hexToRGB>, ratio: number) => {
    return {
      r: Math.round(start.r + (end.r - start.r) * ratio),
      g: Math.round(start.g + (end.g - start.g) * ratio),
      b: Math.round(start.b + (end.b - start.b) * ratio),
    };
  };

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return "Completed";
    
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const initializeCanvas = (resetPixelOrder: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const totalPixels = width * height;

    const startRGB = hexToRGB(startColor);
    ctx.fillStyle = startColor;
    ctx.fillRect(0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = startRGB.r;
      data[i + 1] = startRGB.g;
      data[i + 2] = startRGB.b;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    imageDataRef.current = imageData;

    // Generate pixel order only if we don't have one yet or if explicitly resetting
    const currentSeed = `${startColor}-${endColor}-${fillMode}`;
    if (resetPixelOrder || seedRef.current !== currentSeed || !pixelOrderRef.current) {
      const pixelOrder = new Uint32Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        pixelOrder[i] = i;
      }

      if (fillMode === "random") {
        // Random shuffling
        for (let i = totalPixels - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pixelOrder[i], pixelOrder[j]] = [pixelOrder[j], pixelOrder[i]];
        }
      } else if (fillMode === "checkerboard") {
        // Checkerboard pattern
        const pixels: Array<{index: number, group: number}> = [];
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const group = (Math.floor(x / 20) + Math.floor(y / 20)) % 2;
            pixels.push({
              index: y * width + x,
              group
            });
          }
        }
        
        pixels.sort((a, b) => a.group - b.group);
        
        for (let i = 0; i < totalPixels; i++) {
          pixelOrder[i] = pixels[i].index;
        }
      }

      pixelOrderRef.current = pixelOrder;
      seedRef.current = currentSeed;
    }

    filledPixelsRef.current = 0;
  };

  const fillPixels = (targetFilled: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !imageDataRef.current || !pixelOrderRef.current) return;

    const totalPixels = canvas.width * canvas.height;
    const oldFilledPixels = filledPixelsRef.current;
    filledPixelsRef.current = targetFilled;

    if (fillMode === "solid") {
      const progressRatio = targetFilled / totalPixels;
      const startRGB = hexToRGB(startColor);
      const endRGB = hexToRGB(endColor);
      const currentColor = interpolateColor(startRGB, endRGB, progressRatio);
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const endRGB = hexToRGB(endColor);
      const data = imageDataRef.current.data;
      const startIdx = Math.max(0, oldFilledPixels - Math.ceil(totalPixels / 60));

      for (let i = startIdx; i < targetFilled && i < totalPixels; i++) {
        const pixelIndex: number = pixelOrderRef.current![i];
        const offset = pixelIndex * 4;
        data[offset] = endRGB.r;
        data[offset + 1] = endRGB.g;
        data[offset + 2] = endRGB.b;
        data[offset + 3] = 255;
      }

      ctx.putImageData(imageDataRef.current, 0, 0);
    }
  };

  const drawFrame = () => {
    if (isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = Date.now();
    const start = startTime.getTime();
    const end = endTime.getTime();

    let currentProgress = 0;
    let remainingMs = 0;

    if (now >= end) {
      currentProgress = 1;
      remainingMs = 0;
      setIsComplete(true);
      setShowConfetti(true);
      
      // Play completion sound effect
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // Create a pleasant "ding" sound
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        // Quick ascending tones for "celebration" feel
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1000, now + 0.1);
        osc.frequency.setValueAtTime(1200, now + 0.2);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {
        // Audio context not available, silent fail
      }
    } else if (now <= start) {
      currentProgress = 0;
      remainingMs = end - start;
    } else {
      currentProgress = (now - start) / (end - start);
      remainingMs = end - now;
    }

    const totalPixels = canvas.width * canvas.height;
    const targetPixels = Math.floor(currentProgress * totalPixels);
    fillPixels(targetPixels);

    setProgress(currentProgress * 100);
    setTimeRemaining(formatTimeRemaining(remainingMs));

    // Calculate rate
    const totalDuration = end - start;
    if (fillMode === "solid") {
      const shadesPerMs = 255 / totalDuration;
      const shadesPerSecond = shadesPerMs * 1000;
      const shadesPerMinute = shadesPerSecond * 60;
      const shadesPerHour = shadesPerMinute * 60;
      const shadesPerDay = shadesPerHour * 24;
      
      if (shadesPerSecond >= 1) {
        setRate(`${shadesPerSecond.toFixed(1)} shades/second`);
      } else if (shadesPerMinute >= 1) {
        setRate(`${shadesPerMinute.toFixed(1)} shades/minute`);
      } else if (shadesPerHour >= 1) {
        setRate(`${shadesPerHour.toFixed(1)} shades/hour`);
      } else if (shadesPerDay >= 1) {
        setRate(`${shadesPerDay.toFixed(1)} shades/day`);
      } else {
        const daysPerShade = 1 / shadesPerDay;
        if (daysPerShade < 365) {
          setRate(`1 shade/${daysPerShade.toFixed(1)} days`);
        } else {
          setRate(`1 shade/${(daysPerShade / 365).toFixed(1)} years`);
        }
      }
    } else {
      const pixelsPerMs = totalPixels / totalDuration;
      const pixelsPerSecond = pixelsPerMs * 1000;
      const pixelsPerMinute = pixelsPerSecond * 60;
      const pixelsPerHour = pixelsPerMinute * 60;
      const pixelsPerDay = pixelsPerHour * 24;
      
      if (pixelsPerSecond >= 1) {
        setRate(`${pixelsPerSecond.toFixed(1)} pixels/second`);
      } else if (pixelsPerMinute >= 1) {
        setRate(`${pixelsPerMinute.toFixed(1)} pixels/minute`);
      } else if (pixelsPerHour >= 1) {
        setRate(`${pixelsPerHour.toFixed(1)} pixels/hour`);
      } else if (pixelsPerDay >= 1) {
        setRate(`${pixelsPerDay.toFixed(1)} pixels/day`);
      } else {
        const daysPerPixel = 1 / pixelsPerDay;
        if (daysPerPixel < 365) {
          setRate(`1 pixel/${daysPerPixel.toFixed(1)} days`);
        } else {
          setRate(`1 pixel/${(daysPerPixel / 365).toFixed(1)} years`);
        }
      }
    }

    if (currentProgress < 1) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    }
  };

  useEffect(() => {
    initializeCanvas(false);

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = Date.now();
      const start = startTime.getTime();
      const end = endTime.getTime();

      let currentProgress = 0;
      if (now >= end) {
        currentProgress = 1;
      } else if (now > start) {
        currentProgress = (now - start) / (end - start);
      }

      initializeCanvas(false);
      if (canvas) {
        const totalPixels = canvas.width * canvas.height;
        filledPixelsRef.current = Math.floor(currentProgress * totalPixels);
        fillPixels(filledPixelsRef.current);
      }
    };

    window.addEventListener("resize", handleResize);

    if (!isPaused) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startTime, endTime, startColor, endColor, fillMode, isPaused]);

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}

      {/* Title Display */}
      {title && !isComplete && (
        <div className="fixed top-8 md:top-12 left-1/2 -translate-x-1/2 z-20 px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl bg-black/75 backdrop-blur-xl border border-white/20 max-w-[90vw] md:max-w-none">
          <h1 className="text-lg md:text-3xl font-bold text-white text-center line-clamp-1">{title}</h1>
        </div>
      )}

      {/* Progress Display */}
      {showControls && !isComplete && (
        <div className="fixed bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 bg-black/75 backdrop-blur-xl px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl border border-white/20">
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2">{progress.toFixed(2)}%</div>
            <div className="text-xs md:text-sm text-white/60 font-medium">{timeRemaining} remaining</div>
            <div className="text-xs text-white/50 font-medium mt-1">{rate}</div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm p-4">
          <div className="animate-in zoom-in duration-500 bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-xl px-8 md:px-16 py-8 md:py-12 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl max-w-sm w-full">
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 md:mb-4">
                100%
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">Complete! 🎉</div>
              <div className="text-xs md:text-sm text-white/60 mb-6 md:mb-8">Timer finished successfully</div>
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <button className="px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition text-sm md:text-base">
                  Share
                </button>
                <button className="px-4 md:px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition text-sm md:text-base">
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
