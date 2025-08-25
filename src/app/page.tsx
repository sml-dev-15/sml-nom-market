"use client";

import { Footer } from "@/components/feature/Footer";
import { Hero } from "@/components/feature/Hero";
import { Navbar } from "@/components/feature/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-background via-background/95 to-muted/50">
      <header className="flex-none sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
        <Navbar />
      </header>

      <main
        id="main-content"
        className="flex-grow relative overflow-hidden p-5"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/.08),transparent)]" />
        <Hero />
      </main>

      <footer className="flex-none border-t border-border/20 bg-background/95 backdrop-blur-sm">
        <Footer />
      </footer>
    </div>
  );
}
