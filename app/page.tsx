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
    <div>
      <Navigation />

      <main>
        <h1>
          Visual Countdowns & Timers
        </h1>
        
        <p>
          Create stunning pixel-filling timers and countdowns. Share them with the world or keep them private. Customize colors, patterns, and modes to fit your needs.
        </p>

        <div>
          <Link href="/create">
            Create Timer
          </Link>
          <Link href="/gallery">
            Browse Gallery
          </Link>
        </div>

        {exampleTimers.length > 0 && (
          <div>
            <h2>Example Timers</h2>
            <div>
              {exampleTimers.map((timer) => (
                <Link
                  key={timer.id}
                  href={`/timer/${timer.shareToken}`}
                >
                  <div>
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
                  <div>
                    <h3>
                      {timer.title}
                    </h3>
                    {timer.description && (
                      <p>{timer.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <div>
            <div>🎨</div>
            <h3>Customizable</h3>
            <p>Choose from multiple fill patterns and custom color gradients.</p>
          </div>

          <div>
            <div>🔗</div>
            <h3>Shareable</h3>
            <p>Share timers via link, embed them, or share on social media.</p>
          </div>

          <div>
            <div>🌍</div>
            <h3>Social</h3>
            <p>Discover timers from others in our community gallery.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
