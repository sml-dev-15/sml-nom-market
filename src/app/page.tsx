"use client";

import { Footer } from "@/components/feature/Footer";
import { Hero } from "@/components/feature/Hero";
import { Landing } from "@/components/feature/Landing";
import { Navbar } from "@/components/feature/Navbar";
import { ALL_NAV_TAB_IDS, type NavTabId } from "@/components/feature/Navbar/nav-tabs";
import { TaskCalculator } from "@/components/feature/TaskCalculator";
import { CraftCalculator } from "@/components/feature/TaskCalculator/CraftCalculatorr";
import { ProfileSearch } from "@/components/feature/ProfileSearch";
import { useState, useLayoutEffect, useEffect, useCallback } from "react";

export type PageView = "landing" | NavTabId;

function isNavTabId(hash: string): hash is NavTabId {
  return ALL_NAV_TAB_IDS.includes(hash as NavTabId);
}

function viewFromHash(): PageView {
  const hash = window.location.hash.replace("#", "");
  if (hash === "guild") return "hero";
  if (hash && isNavTabId(hash)) return hash;
  return "landing";
}

export default function HomePage() {
  const [view, setView] = useState<PageView>("landing");

  const syncViewFromHash = useCallback(() => {
    const next = viewFromHash();
    setView(next);
    if (window.location.hash.replace("#", "") === "guild") {
      window.history.replaceState(null, "", "#hero");
    }
  }, []);

  useLayoutEffect(() => {
    syncViewFromHash();
  }, [syncViewFromHash]);

  useEffect(() => {
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, [syncViewFromHash]);

  const openFeature = (tabId: NavTabId) => {
    setView(tabId);
    const target = `#${tabId}`;
    if (window.location.hash !== target) {
      window.location.hash = tabId;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setView("landing");
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", base);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeTab = view === "landing" ? null : view;

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <header className="flex-none sticky top-0 z-50">
        <Navbar
          activeTab={activeTab}
          onTabChange={openFeature}
          onGoHome={goHome}
        />
      </header>

      <main id="main-content" className="relative flex-grow">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6">
          {view === "landing" && <Landing onOpenFeature={openFeature} />}
          {view === "hero" && <Hero />}
          {view === "craft" && <CraftCalculator />}
          {view === "calculator" && <TaskCalculator />}
          {view === "profile" && <ProfileSearch />}
        </div>
      </main>

      <footer className="flex-none border-t border-border/30 bg-muted/30">
        <Footer />
      </footer>
    </div>
  );
}
