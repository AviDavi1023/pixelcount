"use client";

import { useEffect, useRef, useState } from "react";

interface PixelTimerProps {
  startTime: Date;
  endTime: Date;
  startColor: string;
  endColor: string;
  fillMode: "random" | "linear" | "solid";
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

  const pixelOrderRef = useRef<Uint32Array | undefined>(undefined);
  const imageDataRef = useRef<ImageData | undefined>(undefined);
  const filledPixelsRef = useRef(0);
  const seedRef = useRef<string>("");
  
  // Use fixed logical resolution for consistency across displays
  const LOGICAL_WIDTH = 1920;
  const LOGICAL_HEIGHT = 1080;

  const hexToRGB = (hex: string) => {
    const num = parseInt(hex.slice(1), 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  // Initialize canvas on mount only
  useEffect(() => {
    initializeCanvas(true);
  }, []);

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

    // Use fixed logical resolution instead of actual window size
    const width = (canvas.width = LOGICAL_WIDTH);
    const height = (canvas.height = LOGICAL_HEIGHT);
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
        for (let i = totalPixels - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pixelOrder[i], pixelOrder[j]] = [pixelOrder[j], pixelOrder[i]];
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

    // No need for resize handler since we use fixed resolution
    // Canvas will scale via CSS to fit any display

    if (!isPaused) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startTime, endTime, startColor, endColor, fillMode, isPaused]);

  return (
    <div className="fixed inset-0">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          objectFit: 'cover',
          imageRendering: 'pixelated'
        }}
      />

      {/* Title Display */}
      {title && !isComplete && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-20 px-10 py-5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/20">
          <h1 className="text-3xl font-bold text-white text-center">{title}</h1>
        </div>
      )}

      {/* Progress Display */}
      {showControls && !isComplete && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 bg-black/75 backdrop-blur-xl px-12 py-6 rounded-3xl border border-white/20">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{progress.toFixed(2)}%</div>
            <div className="text-sm text-white/60 font-medium">{timeRemaining} remaining</div>
            <div className="text-xs text-white/50 font-medium mt-1">{rate}</div>
            <div className="text-xs text-white/40 font-medium mt-1">1920×1080 resolution</div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
          <div className="bg-black/90 backdrop-blur-xl px-16 py-12 rounded-3xl border border-white/20">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4">100.00%</div>
              <div className="text-2xl text-white/80 font-medium">Complete! 🎉</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
