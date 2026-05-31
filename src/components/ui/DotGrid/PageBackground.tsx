"use client";

import DotGrid from "./DotGrid";

export function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    >
      <DotGrid
        dotSize={10}
        gap={15}
        baseColor="#3a3632"
        activeColor="#c8872e"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
        className="h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/90" />
    </div>
  );
}
