"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FEATURES } from "@/components/feature/Navbar/nav-tabs";
import type { NavTabId } from "@/components/feature/Navbar/nav-tabs";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Package,
  ShoppingCart,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_STYLES: Record<NavTabId, string> = {
  hero: "border-primary/25 bg-primary/5",
  craft: "border-amber-500/25 bg-amber-500/5",
  calculator: "border-chart-2/25 bg-chart-2/5",
  profile: "border-blue-500/25 bg-blue-500/5",
};

const ICON_STYLES: Record<NavTabId, string> = {
  hero: "text-primary",
  craft: "text-amber-400",
  calculator: "text-chart-2",
  profile: "text-blue-400",
};

function SummaryCard({
  icon,
  title,
  value,
  subValue,
  accentClass,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subValue?: string;
  accentClass: string;
}) {
  return (
    <Card
      className={cn(
        "border shadow-sm transition-all hover:shadow-md",
        accentClass
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
            {title}
          </span>
        </div>
        <p className="text-lg font-bold font-mono">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type LandingProps = {
  onOpenFeature: (tabId: NavTabId) => void;
};

export function Landing({ onOpenFeature }: LandingProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 py-2 sm:py-4">
      <Card className="bg-card border-border shadow-md overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="font-mono text-xs border-primary/30 text-primary w-fit"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Nomstead marketplace tools
              </Badge>
              <CardTitle className="text-2xl sm:text-4xl font-bold font-mono tracking-tight">
                Welcome to{" "}
                <span className="text-primary">SML Tavern</span>
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground font-mono max-w-2xl leading-relaxed">
                Browse live listings, compare craft vs buy costs, rank energy
                efficiency, and look up any trader — all in one dark fantasy
                marketplace hub.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button
                type="button"
                className="font-mono gap-2"
                onClick={() => onOpenFeature("hero")}
              >
                <BarChart3 className="h-4 w-4" />
                Open Marketplace
              </Button>
              <Button
                type="button"
                variant="outline"
                className="font-mono gap-2"
                onClick={() => onOpenFeature("calculator")}
              >
                <Zap className="h-4 w-4" />
                Energy Calculator
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <SummaryCard
          icon={<LayoutGrid className="h-4 w-4 text-primary" />}
          title="Tools"
          value="4"
          subValue="Market, craft, energy, profiles"
          accentClass="border-primary/25 bg-primary/5"
        />
        <SummaryCard
          icon={<Package className="h-4 w-4 text-chart-4" />}
          title="For Sale"
          value="Live"
          subValue="Browse items you can purchase"
          accentClass="border-chart-4/25 bg-chart-4/5"
        />
        <SummaryCard
          icon={<ShoppingCart className="h-4 w-4 text-chart-3" />}
          title="Wants to Buy"
          value="Live"
          subValue="Find buy orders to sell into"
          accentClass="border-chart-3/25 bg-chart-3/5"
        />
        <SummaryCard
          icon={<Sparkles className="h-4 w-4 text-blue-400" />}
          title="Real Stock"
          value="Accurate"
          subValue="Costs use actual market availability"
          accentClass="border-blue-500/25 bg-blue-500/5"
        />
      </div>

      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-mono flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Explore Tools
            <Badge variant="secondary" className="ml-1 font-mono text-xs">
              {FEATURES.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Pick a tool below or use the navigation bar above.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.id}
                  className={cn(
                    "border shadow-sm transition-all hover:shadow-md hover:border-primary/20",
                    ACCENT_STYLES[feature.id]
                  )}
                >
                  <CardContent className="p-5 flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "rounded-md border border-border/50 bg-background/40 p-2 shrink-0",
                            ICON_STYLES[feature.id]
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold font-mono truncate">
                            {feature.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="mt-1 font-mono text-[10px] border-border/60"
                          >
                            {feature.shortLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground font-mono leading-relaxed flex-1">
                      {feature.description}
                    </p>

                    <ul className="space-y-1.5 text-xs text-muted-foreground font-mono">
                      {feature.highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-primary shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full font-mono gap-2 mt-auto border-primary/20 hover:bg-primary/10"
                      onClick={() => onOpenFeature(feature.id)}
                    >
                      Open {feature.shortLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-accent/10 border-accent/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold text-foreground font-mono">
              Getting started:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 font-mono">
              <li>
                • Start with <strong>Marketplace</strong> to browse{" "}
                <strong>For Sale</strong> and <strong>Wants to Buy</strong>{" "}
                listings
              </li>
              <li>
                • Use <strong>Energy</strong> to find the most efficient food
                and energy items by price
              </li>
              <li>
                • Use <strong>Craft</strong> to compare buying finished goods
                vs crafting from raw materials
              </li>
              <li>
                • Search any player in <strong>Profile</strong> to see their
                full marketplace activity
              </li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
