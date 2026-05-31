"use client";

import { Footer } from "@/components/feature/Footer";
import { Hero } from "@/components/feature/Hero";
import { Landing } from "@/components/feature/Landing";
import { Navbar } from "@/components/feature/Navbar";
import { ALL_NAV_TAB_IDS, type NavTabId } from "@/components/feature/Navbar/nav-tabs";
import { TaskCalculator } from "@/components/feature/TaskCalculator";
import { CraftCalculator } from "@/components/feature/TaskCalculator/CraftCalculatorr";
import { ProfileSearch } from "@/components/feature/ProfileSearch";
import { Container } from "@/components/ui/container";
import { Hammer, Zap } from "lucide-react";
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
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="w-full">
            {view === "landing" && <Landing onOpenFeature={openFeature} />}

            {view === "hero" && <Hero />}

            {view === "craft" && (
              <div className="py-6">
                <Container>
                  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-lg shadow-amber-500/20">
                        <Hammer className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                          Building Cost Calculator
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Estimate crafting costs for buildings
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
                    <CraftCalculator />
                  </div>
                </Container>
              </div>
            )}

            {view === "calculator" && (
              <div className="py-6">
                <Container>
                  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-lg shadow-blue-500/20">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                          Energy Cost Calculator
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Analyze energy costs for items
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
                    <TaskCalculator />
                  </div>
                </Container>
              </div>
            )}

            {view === "profile" && <ProfileSearch />}
          </div>
        </div>
      </main>

      <footer className="flex-none border-t border-border/30 bg-muted/30">
        <Footer />
      </footer>
    </div>
  );
}
