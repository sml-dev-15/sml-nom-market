"use client";

import { Footer } from "@/components/feature/Footer";
import { GuildList } from "@/components/feature/GuildList";
import { Hero } from "@/components/feature/Hero";
import { Navbar } from "@/components/feature/Navbar";
import { TaskCalculator } from "@/components/feature/TaskCalculator";
import { CraftCalculator } from "@/components/feature/TaskCalculator/CraftCalculatorr";
import { ProfileSearch } from "@/components/feature/ProfileSearch";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Store,
  Hammer,
  Zap,
  ArrowRight,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

const TAB_CONFIG = [
  {
    id: "hero",
    label: "Marketplace",
    shortLabel: "Market",
    icon: Store,
    description: "Browse all market listings",
  },
  {
    id: "guild",
    label: "Guild The One",
    shortLabel: "Guild",
    icon: Users,
    description: "Trusted guild trades",
  },
  {
    id: "craft",
    label: "Crafting Calculator",
    shortLabel: "Craft",
    icon: Hammer,
    description: "Building cost estimates",
  },
  {
    id: "calculator",
    label: "Energy Calculator",
    shortLabel: "Energy",
    icon: Zap,
    description: "Energy cost analysis",
  },
  {
    id: "profile",
    label: "Owner Profile",
    shortLabel: "Profile",
    icon: User,
    description: "View owner marketplace listings",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [showWelcome, setShowWelcome] = useState(true);

  // Filter out guild tab for now
  const visibleTabs = TAB_CONFIG.filter((tab) => tab.id !== "guild");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && visibleTabs.some((tab) => tab.id === hash)) {
      setActiveTab(hash);
      setShowWelcome(false);
    } else if (hash === "guild") {
      // If someone tries to access guild tab, redirect to hero
      setActiveTab("hero");
      setShowWelcome(false);
      window.history.replaceState(null, "", "#hero");
    }
  }, [visibleTabs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowWelcome(false);
    window.history.replaceState(null, "", `#${value}`);
  };

  const handleQuickNav = (tabId: string) => {
    setActiveTab(tabId);
    setShowWelcome(false);
    window.history.replaceState(null, "", `#${tabId}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="flex-none sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border/50 shadow-sm">
        <Navbar />
      </header>

      <main id="main-content" className="flex-grow relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/.06),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

        <div className="container mx-auto max-w-7xl px-4 py-6">
          {/* Welcome Section - Shows on first visit */}
          {showWelcome && (
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
                {visibleTabs.map((tab) => (
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

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-sm py-2 sm:py-3 -mx-4 px-4 mb-4">
              <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 h-10 sm:h-12 p-1 bg-muted/80">
                {visibleTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-1 sm:px-3"
                  >
                    <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{tab.shortLabel}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="hero" className="mt-0 animate-in fade-in-50 duration-300">
              <Hero />
            </TabsContent>

            <TabsContent value="guild" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="py-6">
                <Container>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20">
                        <Users className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Guild The One
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Trade safely with trusted guild members
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
                    <GuildList />
                  </div>
                </Container>
              </div>
            </TabsContent>

            <TabsContent value="craft" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="py-6">
                <Container>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
                        <Hammer className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Building Cost Calculator
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Estimate crafting costs for buildings
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
                    <CraftCalculator />
                  </div>
                </Container>
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="mt-0 animate-in fade-in-50 duration-300">
              <div className="py-6">
                <Container>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                          Energy Cost Calculator
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Analyze energy costs for items
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
                    <TaskCalculator />
                  </div>
                </Container>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0 animate-in fade-in-50 duration-300">
              <ProfileSearch />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="flex-none border-t border-border/30 bg-muted/30">
        <Footer />
      </footer>
    </div>
  );
}
