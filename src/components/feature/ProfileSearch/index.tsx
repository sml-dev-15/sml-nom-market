"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  User,
  ArrowLeft,
  Sparkles,
  Users,
  LayoutGrid,
  Package,
  ShoppingCart,
} from "lucide-react";
import { OwnerProfileView } from "@/components/feature/OwnerProfile";
import { useFetchMarketData } from "@/hooks/data-fetch";
import { cn } from "@/lib/utils";

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

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
        <p className="text-lg font-bold font-mono tabular-nums">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function OwnerPill({
  owner,
  listingCount,
  onClick,
  variant = "secondary",
}: {
  owner: string;
  listingCount?: number;
  onClick: () => void;
  variant?: "secondary" | "outline";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono transition-all",
        "hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(251,191,36,0.08)]",
        variant === "secondary"
          ? "bg-muted/50 border-border/60 text-foreground"
          : "bg-transparent border-primary/20 text-primary"
      )}
    >
      <User className="h-3 w-3 shrink-0 opacity-60" />
      <span>{owner}</span>
      {listingCount != null && listingCount > 0 && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          ({listingCount})
        </span>
      )}
    </button>
  );
}

export function ProfileSearch() {
  const [searchOwner, setSearchOwner] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const { data: toBuyData } = useFetchMarketData("toBuy");
  const { data: toSellData } = useFetchMarketData("toSell");

  const ownerStats = useMemo(() => {
    const counts = new Map<string, { forSale: number; wantsToBuy: number }>();

    toBuyData?.forEach((item) => {
      if (!item.owner) return;
      const current = counts.get(item.owner) ?? { forSale: 0, wantsToBuy: 0 };
      current.forSale += 1;
      counts.set(item.owner, current);
    });

    toSellData?.forEach((item) => {
      if (!item.owner) return;
      const current = counts.get(item.owner) ?? { forSale: 0, wantsToBuy: 0 };
      current.wantsToBuy += 1;
      counts.set(item.owner, current);
    });

    const owners = Array.from(counts.entries())
      .map(([owner, stats]) => ({
        owner,
        ...stats,
        total: stats.forSale + stats.wantsToBuy,
      }))
      .sort((a, b) => b.total - a.total || a.owner.localeCompare(b.owner));

    return {
      owners,
      totalOwners: owners.length,
      totalForSale: toBuyData?.length ?? 0,
      totalWantsToBuy: toSellData?.length ?? 0,
    };
  }, [toBuyData, toSellData]);

  const filteredOwners = useMemo(() => {
    if (!searchOwner.trim()) return [];
    const searchLower = searchOwner.toLowerCase();
    return ownerStats.owners
      .filter((entry) => entry.owner.toLowerCase().includes(searchLower))
      .slice(0, 12);
  }, [ownerStats.owners, searchOwner]);

  const popularOwners = useMemo(
    () => ownerStats.owners.slice(0, 20),
    [ownerStats.owners]
  );

  const handleOwnerSelect = (owner: string) => {
    setSelectedOwner(owner);
    setSearchOwner(owner);
  };

  const handleSearch = () => {
    const trimmed = searchOwner.trim();
    if (!trimmed) return;

    const exactMatch = ownerStats.owners.find(
      (entry) => entry.owner.toLowerCase() === trimmed.toLowerCase()
    );
    setSelectedOwner(exactMatch?.owner ?? trimmed);
  };

  const handleBack = () => {
    setSelectedOwner(null);
    setSearchOwner("");
  };

  if (selectedOwner) {
    return (
      <div className="w-full py-8">
        <Container>
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 font-mono"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
          <OwnerProfileView ownerId={selectedOwner} />
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <Container>
        <Card className="bg-card border-border shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <User className="h-5 w-5 text-primary" />
              Owner Profile Search
            </CardTitle>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Find any player and browse their marketplace listings across all tiles.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <SummaryCard
                icon={<Users className="h-4 w-4 text-primary" />}
                title="Total Owners"
                value={formatNumber(ownerStats.totalOwners)}
                subValue="Active on the marketplace"
                accentClass="border-primary/25 bg-primary/5"
              />
              <SummaryCard
                icon={<Package className="h-4 w-4 text-chart-4" />}
                title="For Sale Listings"
                value={formatNumber(ownerStats.totalForSale)}
                subValue="Items listed for purchase"
                accentClass="border-chart-4/25 bg-chart-4/5"
              />
              <SummaryCard
                icon={<ShoppingCart className="h-4 w-4 text-chart-3" />}
                title="Buy Orders"
                value={formatNumber(ownerStats.totalWantsToBuy)}
                subValue="Items owners want to buy"
                accentClass="border-chart-3/25 bg-chart-3/5"
              />
              <SummaryCard
                icon={<LayoutGrid className="h-4 w-4 text-blue-400" />}
                title="Top Trader"
                value={popularOwners[0]?.owner ?? "—"}
                subValue={
                  popularOwners[0]
                    ? `${formatNumber(popularOwners[0].total)} total listings`
                    : "Search to explore profiles"
                }
                accentClass="border-blue-500/25 bg-blue-500/5"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="owner-search" className="font-mono text-sm">
                Search Owner
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    id="owner-search"
                    placeholder="Enter owner name (e.g., moonlit, jiro)..."
                    value={searchOwner}
                    onChange={(e) => setSearchOwner(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="pr-8 font-mono"
                  />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchOwner.trim()}
                  className="font-mono shrink-0"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {filteredOwners.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Matches ({filteredOwners.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredOwners.map((entry) => (
                    <OwnerPill
                      key={entry.owner}
                      owner={entry.owner}
                      listingCount={entry.total}
                      onClick={() => handleOwnerSelect(entry.owner)}
                      variant="outline"
                    />
                  ))}
                </div>
              </div>
            )}

            {!searchOwner.trim() && popularOwners.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                    Popular Owners
                  </p>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatNumber(ownerStats.totalOwners)} total
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularOwners.map((entry) => (
                    <OwnerPill
                      key={entry.owner}
                      owner={entry.owner}
                      listingCount={entry.total}
                      onClick={() => handleOwnerSelect(entry.owner)}
                    />
                  ))}
                </div>
                {ownerStats.totalOwners > 20 && (
                  <p className="text-xs text-muted-foreground font-mono">
                    +{formatNumber(ownerStats.totalOwners - 20)} more owners — use
                    search to find them
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Alert className="bg-accent/10 border-accent/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-foreground font-mono">
                How it works:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>
                  • Enter an owner name to view all their marketplace listings
                </li>
                <li>
                  • <strong>For Sale</strong> shows items they&apos;re selling;{" "}
                  <strong>Wants to Buy</strong> shows what they&apos;re looking to
                  purchase
                </li>
                <li>
                  • Filter, sort, and group listings on the profile page to compare
                  prices
                </li>
                <li>
                  • Click any owner name in the main marketplace table to jump to
                  their profile
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </Container>
    </div>
  );
}
