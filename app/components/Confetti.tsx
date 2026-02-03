"use client";

import { useEffect, useState } from "react";

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

export default function Confetti() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Create confetti pieces
    const colors = [
      "#a855f7", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
      "#8b5cf6", // violet
      "#f472b6", // rose
      "#7c3aed", // violet
    ];

    const newConfetti: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setConfetti(newConfetti);

    // Clean up after animation completes
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="fixed pointer-events-none"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            animation: `fall ${piece.duration}s linear ${piece.delay}s forwards`,
            width: "8px",
            height: "8px",
            backgroundColor: piece.color,
            borderRadius: "50%",
            opacity: 0.8,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
