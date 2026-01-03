"use client";

import { useEffect, useRef } from "react";

interface PixelTimerThumbnailProps {
  startTime: Date;
  endTime: Date;
  startColor: string;
  endColor: string;
  fillMode: "random" | "linear" | "solid";
  width?: number;
  height?: number;
}

export default function PixelTimerThumbnail({
  startTime,
  endTime,
  startColor,
  endColor,
  fillMode,
  width = 300,
  height = 200,
}: PixelTimerThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelOrderRef = useRef<Uint32Array | undefined>(undefined);

  const hexToRGB = (hex: string) => {
    const num = parseInt(hex.slice(1), 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const interpolateColor = (start: ReturnType<typeof hexToRGB>, end: ReturnType<typeof hexToRGB>, ratio: number) => {
    return {
      r: Math.round(start.r + (end.r - start.r) * ratio),
      g: Math.round(start.g + (end.g - start.g) * ratio),
      b: Math.round(start.b + (end.b - start.b) * ratio),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const totalPixels = width * height;

    // Initialize with start color
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

    // Generate pixel order once
    if (!pixelOrderRef.current) {
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
    }

    // Calculate current progress
    const now = Date.now();
    const start = startTime.getTime();
    const end = endTime.getTime();

    let currentProgress = 0;
    if (now >= end) {
      currentProgress = 1;
    } else if (now <= start) {
      currentProgress = 0;
    } else {
      currentProgress = (now - start) / (end - start);
    }

    // Fill pixels based on progress
    const targetPixels = Math.floor(currentProgress * totalPixels);
    const endRGB = hexToRGB(endColor);

    if (fillMode === "solid") {
      const currentColor = interpolateColor(startRGB, endRGB, currentProgress);
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      for (let i = 0; i < targetPixels && i < totalPixels; i++) {
        const pixelIndex: number = pixelOrderRef.current![i];
        const offset = pixelIndex * 4;
        data[offset] = endRGB.r;
        data[offset + 1] = endRGB.g;
        data[offset + 2] = endRGB.b;
        data[offset + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Animation loop for live updates
    let animationFrameId: number;
    const animate = () => {
      const now = Date.now();
      let newProgress = 0;

      if (now >= end) {
        newProgress = 1;
      } else if (now > start) {
        newProgress = (now - start) / (end - start);
      }

      const targetPixels = Math.floor(newProgress * totalPixels);

      if (fillMode === "solid") {
        const currentColor = interpolateColor(startRGB, endRGB, newProgress);
        ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Redraw only changed pixels
        const newImageData = ctx.getImageData(0, 0, width, height);
        const newData = newImageData.data;

        for (let i = 0; i < targetPixels && i < totalPixels; i++) {
          const pixelIndex: number = pixelOrderRef.current![i];
          const offset = pixelIndex * 4;
          newData[offset] = endRGB.r;
          newData[offset + 1] = endRGB.g;
          newData[offset + 2] = endRGB.b;
          newData[offset + 3] = 255;
        }

        ctx.putImageData(newImageData, 0, 0);
      }

      if (newProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [startTime, endTime, startColor, endColor, fillMode, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: "0.5rem",
      }}
    />
  );
}
