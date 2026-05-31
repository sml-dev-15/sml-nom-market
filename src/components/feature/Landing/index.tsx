"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FEATURES } from "@/components/feature/Navbar/nav-tabs";
import type { NavTabId } from "@/components/feature/Navbar/nav-tabs";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_STYLES: Record<NavTabId, string> = {
  hero: "from-primary/20 to-primary/5 border-primary/30",
  craft: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  calculator: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  profile: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
};

const ICON_STYLES: Record<NavTabId, string> = {
  hero: "bg-primary/15 text-primary",
  craft: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  calculator: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  profile: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

type LandingProps = {
  onOpenFeature: (tabId: NavTabId) => void;
};

export function Landing({ onOpenFeature }: LandingProps) {
  return (
    <div className="mx-auto max-w-5xl px-2 py-8 sm:py-12">
      <section className="mb-10 text-center sm:mb-14">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Nomstead tools for smarter trading
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            SML Tavern
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Your hub for marketplace analytics, crafting math, and owner lookups.
          Pick a tool from the navigation above or explore what each feature
          offers below.
        </p>
      </section>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.id}
                className={cn(
                  "flex h-full flex-col gap-5 border bg-gradient-to-br p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7",
                  ACCENT_STYLES[feature.id]
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn("rounded-lg p-2.5", ICON_STYLES[feature.id])}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="shrink-0 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {feature.shortLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold leading-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
                  {feature.highlights.map((item) => (
                    <li key={item} className="flex gap-2.5 pl-0.5">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  className="mt-auto w-full gap-2 sm:w-fit"
                  onClick={() => onOpenFeature(feature.id)}
                >
                  Open {feature.shortLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
