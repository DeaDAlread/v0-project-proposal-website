"use client";

import { useEffect, useRef } from "react";

export function AudioManager() {
  const correctGuessRef = useRef<HTMLAudioElement | null>(null);
  const roundStartRef = useRef<HTMLAudioElement | null>(null);
  const gameEndRef = useRef<HTMLAudioElement | null>(null);
  const timerWarningRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    correctGuessRef.current = new Audio("/sounds/correct.mp3");
    roundStartRef.current = new Audio("/sounds/round-start.mp3");
    gameEndRef.current = new Audio("/sounds/game-end.mp3");
    timerWarningRef.current = new Audio("/sounds/timer-warning.mp3");

    // Set volumes
    if (correctGuessRef.current) correctGuessRef.current.volume = 0.5;
    if (roundStartRef.current) roundStartRef.current.volume = 0.3;
    if (gameEndRef.current) gameEndRef.current.volume = 0.6;
    if (timerWarningRef.current) timerWarningRef.current.volume = 0.4;

    // Listen for custom audio events
    const handleAudioEvent = (e: CustomEvent) => {
      const { type } = e.detail;
      
      switch (type) {
        case "correct-guess":
          correctGuessRef.current?.play().catch(() => {});
          break;
        case "round-start":
          roundStartRef.current?.play().catch(() => {});
          break;
        case "game-end":
          gameEndRef.current?.play().catch(() => {});
          break;
        case "timer-warning":
          timerWarningRef.current?.play().catch(() => {});
          break;
      }
    };

    window.addEventListener("play-sound", handleAudioEvent as EventListener);

    return () => {
      window.removeEventListener("play-sound", handleAudioEvent as EventListener);
    };
  }, []);

  return null;
}

// Helper function to trigger sounds
export function playSound(type: "correct-guess" | "round-start" | "game-end" | "timer-warning") {
  window.dispatchEvent(new CustomEvent("play-sound", { detail: { type } }));
}
