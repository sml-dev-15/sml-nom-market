"use client";

import { useTimerStore } from "@/hooks/timer-store";
import { useEffect, useState } from "react";

export function TimerDisplay({ timerId }: { timerId: string }) {
  const timer = useTimerStore((state) =>
    state.timers.find((t) => t.id === timerId)
  );
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!timer) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      return Math.max(0, timer.endTime - now);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!timer || timeLeft === null) return null;

  if (timeLeft <= 0) {
    return <span className="text-green-600 text-xs">Ready</span>;
  }

  const hours = Math.floor(timeLeft / (3600 * 1000));
  const minutes = Math.floor((timeLeft % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

  return (
    <span className="text-blue-600 text-xs">
      {hours}h {minutes}m {seconds}s
    </span>
  );
}
