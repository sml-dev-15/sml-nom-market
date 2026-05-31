"use client";

import { Footer } from "@/components/feature/Footer";
import { Hero } from "@/components/feature/Hero";
import { Navbar } from "@/components/feature/Navbar";
import {
  ALL_NAV_TAB_IDS,
  MAIN_NAV_TABS,
  PROFILE_NAV_TAB,
  type NavTabId,
} from "@/components/feature/Navbar/nav-tabs";
import { TaskCalculator } from "@/components/feature/TaskCalculator";
import { CraftCalculator } from "@/components/feature/TaskCalculator/CraftCalculatorr";
import { ProfileSearch } from "@/components/feature/ProfileSearch";
import { Container } from "@/components/ui/container";
import { Hammer, Zap, ArrowRight } from "lucide-react";
import { useState, useLayoutEffect } from "react";

const WELCOME_TABS = [
  ...MAIN_NAV_TABS,
  PROFILE_NAV_TAB,
].map((tab) => ({
  ...tab,
  description:
    tab.id === "hero"
      ? "Browse all market listings"
      : tab.id === "craft"
        ? "Building cost estimates"
        : tab.id === "calculator"
          ? "Energy cost analysis"
          : "View owner marketplace listings",
}));
const WELCOME_DISMISSED_KEY = "welcome-dismissed";

function dismissWelcome() {
  sessionStorage.setItem(WELCOME_DISMISSED_KEY, "1");
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTabId>("hero");
  const [showWelcome, setShowWelcome] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (hash === "guild") {
      setActiveTab("hero");
      window.history.replaceState(null, "", "#hero");
    } else if (hash && ALL_NAV_TAB_IDS.includes(hash as NavTabId)) {
      setActiveTab(hash as NavTabId);
    }

    const hasHash = Boolean(hash);
    const dismissed = sessionStorage.getItem(WELCOME_DISMISSED_KEY);
    if (!hasHash && !dismissed) {
      setShowWelcome(true);
    }

    setIsReady(true);
  }, []);

  const handleTabChange = (tabId: NavTabId) => {
    setActiveTab(tabId);
    dismissWelcome();
    setShowWelcome(false);
    window.history.replaceState(null, "", `#${tabId}`);
  };

  const handleQuickNav = (tabId: NavTabId) => {
    handleTabChange(tabId);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="flex-none sticky top-0 z-50">
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      </header>

      <main id="main-content" className="flex-grow relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/.06),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

        <div className="container mx-auto max-w-7xl px-4 py-6">
          {/* Welcome Section - first visit only (after client init, no SSR flash) */}
          {isReady && showWelcome && (
            <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Welcome to SML Tavern
                </h1>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto px-2">
                  Your one-stop destination for Nomstead marketplace analytics,
                  guild trading, and cost calculations.
                </p>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {WELCOME_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleQuickNav(tab.id)}
                    className="group relative p-3 sm:p-5 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1 line-clamp-1">
                        {tab.shortLabel}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full animate-in fade-in-50 duration-300">
            {activeTab === "hero" && <Hero />}

            {activeTab === "craft" && (
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

            {activeTab === "calculator" && (
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

            {activeTab === "profile" && <ProfileSearch />}
          </div>
        </div>
      </main>

      <footer className="flex-none border-t border-border/30 bg-muted/30">
        <Footer />
      </footer>
    </div>
  );
}
