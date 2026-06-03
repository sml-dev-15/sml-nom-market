import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  TrendingUp,
  Zap,
  Search,
  Download,
  Sparkles,
  Crown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Coins,
  Trophy,
  Filter,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

interface MarketplaceItem {
  tile: {
    url: string;
    owner: string;
  };
  object: {
    slug: string;
    category: string;
    subCategory: string;
    metadata: string | object;
    imageUrl: string;
    thumbnailImageUrl: string;
  };
  pricing: {
    unitPrice: number;
    availableQuantity?: number;
  };
}

interface EnergySource {
  slug: string;
  name: string;
  energy: number;
  category: string;
}

interface EnergyComparisonResult {
  slug: string;
  name: string;
  energy: number;
  lowestPrice: number;
  energyPerGold: number;
  efficiency: number;
  seller?: string;
  url?: string;
  availableQuantity?: number;
  alternativeCount?: number;
}

interface EnergyVsPriceProps {
  marketData: MarketplaceItem[];
}

type SortKey = "rank" | "energy" | "price" | "energyPerGold" | "seller" | "name";
type SortDirection = "asc" | "desc";
type EfficiencyTier =
  | "all"
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "very-poor";

const ENERGY_SOURCES: EnergySource[] = [
  {
    slug: "cake_grape",
    name: "Grape Tart Cake",
    energy: 160,
    category: "cake",
  },
  {
    slug: "cake_pumpkin",
    name: "Pumpkin Spice Cake",
    energy: 120,
    category: "cake",
  },
  {
    slug: "cake_tomato",
    name: "Upside Down Tomato Cake",
    energy: 100,
    category: "cake",
  },
  {
    slug: "cake_potato",
    name: "Golden Potato Cake",
    energy: 80,
    category: "cake",
  },
  { slug: "wine", name: "Wine", energy: 60, category: "beverage" },
  { slug: "cake_carrot", name: "Carrot Cake", energy: 60, category: "cake" },
  { slug: "bread", name: "Bread", energy: 30, category: "baked" },
  {
    slug: "pumpkin_bread",
    name: "Pumpkin Bread",
    energy: 55,
    category: "baked",
  },
  {
    slug: "mushroom_omelette",
    name: "Mushroom Omelette",
    energy: 45,
    category: "meal",
  },
  {
    slug: "mushroom_soup",
    name: "Mushroom Soup",
    energy: 30,
    category: "soup",
  },
  {
    slug: "tomato_omelette",
    name: "Tomato Omelette",
    energy: 30,
    category: "meal",
  },
  { slug: "fries", name: "French Fries", energy: 25, category: "snack" },
  {
    slug: "wrapped_potato",
    name: "Wrapped Potato",
    energy: 20,
    category: "snack",
  },
  { slug: "salad", name: "Veggie Salad", energy: 15, category: "salad" },
  { slug: "apple", name: "Apple", energy: 15, category: "fruit" },
];

const RANK_BADGES = [
  { label: "Best Buy", emoji: "🏆" },
  { label: "Great Value", emoji: "🥈" },
  { label: "Recommended", emoji: "🥉" },
] as const;

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatPrice(value: number): string {
  if (value >= 1_000) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toFixed(2);
}

function getEfficiencyTier(efficiency: number): EfficiencyTier {
  if (efficiency >= 90) return "excellent";
  if (efficiency >= 75) return "good";
  if (efficiency >= 50) return "fair";
  if (efficiency >= 25) return "poor";
  return "very-poor";
}

function getEfficiencyTierLabel(tier: EfficiencyTier): string {
  const labels: Record<EfficiencyTier, string> = {
    all: "All Tiers",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    "very-poor": "Very Poor",
  };
  return labels[tier];
}

function getEfficiencyStyles(efficiency: number) {
  const tier = getEfficiencyTier(efficiency);
  const styles = {
    excellent: {
      bar: "bg-emerald-500",
      glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
      text: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    good: {
      bar: "bg-blue-500",
      glow: "shadow-[0_0_8px_rgba(59,130,246,0.4)]",
      text: "text-blue-400",
      badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    fair: {
      bar: "bg-yellow-500",
      glow: "shadow-[0_0_8px_rgba(234,179,8,0.35)]",
      text: "text-yellow-400",
      badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    },
    poor: {
      bar: "bg-zinc-400",
      glow: "",
      text: "text-zinc-400",
      badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    },
    "very-poor": {
      bar: "bg-red-500",
      glow: "",
      text: "text-red-400",
      badge: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    all: {
      bar: "bg-muted-foreground",
      glow: "",
      text: "text-muted-foreground",
      badge: "bg-muted text-muted-foreground",
    },
  };
  return { tier, ...styles[tier] };
}

function getRankRowStyles(rank: number) {
  if (rank === 1) {
    return "border-l-[3px] border-l-amber-400/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:shadow-[inset_0_0_20px_rgba(251,191,36,0.08)]";
  }
  if (rank === 2) {
    return "border-l-[3px] border-l-slate-300/70 bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent hover:shadow-[inset_0_0_20px_rgba(148,163,184,0.08)]";
  }
  if (rank === 3) {
    return "border-l-[3px] border-l-orange-400/70 bg-gradient-to-r from-orange-600/10 via-orange-600/5 to-transparent hover:shadow-[inset_0_0_20px_rgba(234,88,12,0.08)]";
  }
  return "hover:bg-accent/30 hover:shadow-[inset_0_0_16px_rgba(251,191,36,0.04)]";
}

function EfficiencyBar({ efficiency }: { efficiency: number }) {
  const { tier, bar, glow, text, badge } = getEfficiencyStyles(efficiency);

  return (
    <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
      <div className="flex items-center gap-2 w-full justify-end">
        <span className={cn("font-bold tabular-nums text-sm", text)}>
          {efficiency.toFixed(1)}%
        </span>
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 h-5 font-mono border", badge)}
        >
          {getEfficiencyTierLabel(tier)}
        </Badge>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(efficiency)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Efficiency ${efficiency.toFixed(1)} percent`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", bar, glow)}
          style={{ width: `${Math.min(100, efficiency)}%` }}
        />
      </div>
    </div>
  );
}

function SellerCell({
  seller,
  url,
  alternativeCount,
}: {
  seller?: string;
  url?: string;
  alternativeCount?: number;
}) {
  if (!seller || !url) {
    return (
      <span className="text-muted-foreground text-sm font-mono">No seller</span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 min-w-[100px]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline text-sm font-semibold font-mono truncate max-w-[140px]"
        title={seller}
      >
        {seller}
      </a>
      {alternativeCount != null && alternativeCount > 0 && (
        <span className="text-[10px] text-muted-foreground font-mono">
          +{alternativeCount} alt
        </span>
      )}
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
  className,
  subLabel,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
  subLabel?: string;
}) {
  const isActive = currentSort === sortKey;
  const Icon = isActive
    ? currentDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead className={cn("font-mono", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-primary transition-colors group",
          isActive && "text-primary"
        )}
        aria-sort={
          isActive
            ? currentDirection === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        <span className="flex flex-col items-start leading-tight">
          <span>{label}</span>
          {subLabel && (
            <span className="text-[10px] text-muted-foreground font-normal">
              {subLabel}
            </span>
          )}
        </span>
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
          )}
        />
      </button>
    </TableHead>
  );
}

function SummaryCard({
  icon,
  title,
  itemName,
  value,
  subValue,
  accentClass,
}: {
  icon: ReactNode;
  title: string;
  itemName: string;
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
        <p className="font-bold text-sm font-mono truncate" title={itemName}>
          {itemName}
        </p>
        <p className="text-lg font-bold font-mono mt-1 tabular-nums">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MobileResultCard({
  item,
  rank,
}: {
  item: EnergyComparisonResult;
  rank: number;
}) {
  const rankBadge = rank <= 3 ? RANK_BADGES[rank - 1] : null;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        getRankRowStyles(rank),
        "md:hidden"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-bold text-sm font-mono tabular-nums",
                rank === 1 && "bg-amber-500/20 text-amber-400",
                rank === 2 && "bg-slate-400/20 text-slate-300",
                rank === 3 && "bg-orange-500/20 text-orange-400",
                rank > 3 && "bg-muted text-muted-foreground"
              )}
            >
              {rank}
            </span>
            <div className="min-w-0">
              <p className="font-bold font-mono truncate">{item.name}</p>
              {rankBadge && (
                <Badge
                  variant="outline"
                  className="mt-1 text-[10px] font-mono border-primary/20"
                >
                  {rankBadge.emoji} {rankBadge.label}
                </Badge>
              )}
            </div>
          </div>
          <span className="font-bold text-chart-2 font-mono tabular-nums shrink-0">
            {item.energyPerGold.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
          <div>
            <span className="text-[10px] uppercase text-muted-foreground">
              Energy
            </span>
            <p className="font-bold tabular-nums">{formatNumber(item.energy)} ⚡</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-muted-foreground">
              Price (Gold)
            </span>
            <p className="font-bold tabular-nums">{formatPrice(item.lowestPrice)}</p>
          </div>
        </div>

        <EfficiencyBar efficiency={item.efficiency} />

        <div className="pt-1 border-t border-border/50">
          <SellerCell
            seller={item.seller}
            url={item.url}
            alternativeCount={item.alternativeCount}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function EnergyVsPriceCalculator({ marketData }: EnergyVsPriceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [efficiencyTier, setEfficiencyTier] = useState<EfficiencyTier>("all");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [minEnergy, setMinEnergy] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const categories = useMemo(() => {
    const cats = [...new Set(ENERGY_SOURCES.map((item) => item.category))];
    return ["all", ...cats];
  }, []);

  const energyComparisons = useMemo((): EnergyComparisonResult[] => {
    const findLowestPriceItem = (slug: string) => {
      const matchingItems = marketData.filter(
        (item) => item.object.slug.toLowerCase() === slug.toLowerCase()
      );

      if (matchingItems.length === 0) return null;

      const sortedItems = matchingItems.sort((a, b) => {
        if (a.pricing.unitPrice !== b.pricing.unitPrice) {
          return a.pricing.unitPrice - b.pricing.unitPrice;
        }
        return (
          (b.pricing.availableQuantity || 0) -
          (a.pricing.availableQuantity || 0)
        );
      });

      return {
        ...sortedItems[0],
        alternativeCount: matchingItems.length - 1,
      };
    };

    const results: EnergyComparisonResult[] = ENERGY_SOURCES.map(
      (energyItem) => {
        const marketItem = findLowestPriceItem(energyItem.slug);

        if (!marketItem || marketItem.pricing.unitPrice <= 0) {
          return {
            slug: energyItem.slug,
            name: energyItem.name,
            energy: energyItem.energy,
            lowestPrice: 0,
            energyPerGold: 0,
            efficiency: 0,
          };
        }

        const energyPerGold = energyItem.energy / marketItem.pricing.unitPrice;

        return {
          slug: energyItem.slug,
          name: energyItem.name,
          energy: energyItem.energy,
          lowestPrice: marketItem.pricing.unitPrice,
          energyPerGold,
          efficiency: 0,
          seller: marketItem.tile.owner,
          url: marketItem.tile.url,
          availableQuantity: marketItem.pricing.availableQuantity,
          alternativeCount: marketItem.alternativeCount,
        };
      }
    );

    const maxEnergyPerGold = Math.max(
      ...results.map((r) => r.energyPerGold).filter((v) => v > 0)
    );

    results.forEach((result) => {
      if (result.energyPerGold > 0 && maxEnergyPerGold > 0) {
        result.efficiency = (result.energyPerGold / maxEnergyPerGold) * 100;
      }
    });

    return results;
  }, [marketData]);

  const availableSellers = useMemo(() => {
    const sellers = new Set<string>();
    energyComparisons.forEach((item) => {
      if (item.seller && item.energyPerGold > 0) {
        sellers.add(item.seller);
      }
    });
    return ["all", ...Array.from(sellers).sort()];
  }, [energyComparisons]);

  const filteredResults = useMemo(() => {
    let filtered = energyComparisons.filter(
      (item) =>
        item.energyPerGold > 0 &&
        item.lowestPrice > 0 &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        item.energy >= minEnergy &&
        item.lowestPrice <= maxPrice
    );

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        const energySource = ENERGY_SOURCES.find((es) => es.slug === item.slug);
        return energySource?.category === selectedCategory;
      });
    }

    if (efficiencyTier !== "all") {
      filtered = filtered.filter(
        (item) => getEfficiencyTier(item.efficiency) === efficiencyTier
      );
    }

    if (selectedSeller !== "all") {
      filtered = filtered.filter((item) => item.seller === selectedSeller);
    }

    const directionMultiplier = sortDirection === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "rank":
        case "energyPerGold":
          return (b.energyPerGold - a.energyPerGold) * directionMultiplier;
        case "energy":
          return (a.energy - b.energy) * directionMultiplier;
        case "price":
          return (a.lowestPrice - b.lowestPrice) * directionMultiplier;
        case "seller":
          return (
            (a.seller ?? "").localeCompare(b.seller ?? "") * directionMultiplier
          );
        case "name":
          return a.name.localeCompare(b.name) * directionMultiplier;
        default:
          return b.energyPerGold - a.energyPerGold;
      }
    });
  }, [
    energyComparisons,
    searchTerm,
    selectedCategory,
    efficiencyTier,
    selectedSeller,
    minEnergy,
    maxPrice,
    sortKey,
    sortDirection,
  ]);

  const summaryStats = useMemo(() => {
    if (filteredResults.length === 0) return null;

    const bestDeal = filteredResults.reduce((best, item) =>
      item.energyPerGold > best.energyPerGold ? item : best
    );
    const highestEnergy = filteredResults.reduce((best, item) =>
      item.energy > best.energy ? item : best
    );
    const cheapest = filteredResults.reduce((best, item) =>
      item.lowestPrice < best.lowestPrice ? item : best
    );
    const avgEfficiency =
      filteredResults.reduce((sum, item) => sum + item.efficiency, 0) /
      filteredResults.length;

    return { bestDeal, highestEnergy, cheapest, avgEfficiency };
  }, [filteredResults]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection(key === "rank" || key === "energyPerGold" ? "asc" : "asc");
      }
    },
    [sortKey]
  );

  const exportToExcel = () => {
    if (filteredResults.length === 0) return;

    const worksheetData = filteredResults.map((result, index) => ({
      Rank: index + 1,
      "Item Name": result.name,
      Energy: result.energy,
      "Lowest Price": result.lowestPrice,
      "Energy per Gold": result.energyPerGold,
      "Efficiency Score": `${result.efficiency.toFixed(1)}%`,
      Seller: result.seller || "N/A",
      "Available Stock": result.availableQuantity || "Unknown",
      "Alternative Sellers": result.alternativeCount || 0,
      Recommendation: index < 3 ? "Top Pick" : "Standard",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Energy Efficiency");

    XLSX.writeFile(
      workbook,
      `energy-efficiency-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 100) return "text-chart-2";
    if (energy >= 60) return "text-chart-1";
    if (energy >= 30) return "text-chart-3";
    if (energy >= 15) return "text-chart-4";
    return "text-muted-foreground";
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-chart-2" />
            Energy vs Price Calculator
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={filteredResults.length === 0}
            className="flex items-center gap-1 font-mono"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersExpanded((prev) => !prev)}
              className="font-mono text-xs"
            >
              {filtersExpanded ? (
                <>
                  Hide <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Show <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>

          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4",
              !filtersExpanded && "hidden md:grid"
            )}
          >
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="search" className="font-mono text-sm">
                Search Items
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search energy items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8 font-mono"
                />
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-mono text-sm">
                Category
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="font-mono w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="font-mono"
                    >
                      {category === "all"
                        ? "All Categories"
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="efficiencyTier" className="font-mono text-sm">
                Efficiency Tier
              </Label>
              <Select
                value={efficiencyTier}
                onValueChange={(v) => setEfficiencyTier(v as EfficiencyTier)}
              >
                <SelectTrigger className="font-mono w-full">
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "all",
                      "excellent",
                      "good",
                      "fair",
                      "poor",
                      "very-poor",
                    ] as EfficiencyTier[]
                  ).map((tier) => (
                    <SelectItem key={tier} value={tier} className="font-mono">
                      {getEfficiencyTierLabel(tier)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller" className="font-mono text-sm">
                Seller
              </Label>
              <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                <SelectTrigger className="font-mono w-full">
                  <SelectValue placeholder="All sellers" />
                </SelectTrigger>
                <SelectContent>
                  {availableSellers.map((seller) => (
                    <SelectItem key={seller} value={seller} className="font-mono">
                      {seller === "all" ? "All Sellers" : seller}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minEnergy" className="font-mono text-sm">
                Min Energy ({minEnergy})
              </Label>
              <Input
                id="minEnergy"
                type="range"
                min="0"
                max="160"
                step="5"
                value={minEnergy}
                onChange={(e) => setMinEnergy(Number(e.target.value))}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="font-mono text-sm">
                Max Price ({formatPrice(maxPrice)})
              </Label>
              <Input
                id="maxPrice"
                type="range"
                min="0.01"
                max="10"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summaryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <SummaryCard
              icon={<Trophy className="h-4 w-4 text-amber-400" />}
              title="Best Deal"
              itemName={summaryStats.bestDeal.name}
              value={`${summaryStats.bestDeal.energyPerGold.toFixed(2)} E/G`}
              subValue={`${formatPrice(summaryStats.bestDeal.lowestPrice)} gold · ${summaryStats.bestDeal.efficiency.toFixed(1)}% eff.`}
              accentClass="border-amber-500/25 bg-amber-500/5"
            />
            <SummaryCard
              icon={<Zap className="h-4 w-4 text-chart-2" />}
              title="Highest Energy Item"
              itemName={summaryStats.highestEnergy.name}
              value={`${formatNumber(summaryStats.highestEnergy.energy)} ⚡`}
              subValue={`${formatPrice(summaryStats.highestEnergy.lowestPrice)} gold`}
              accentClass="border-chart-2/25 bg-chart-2/5"
            />
            <SummaryCard
              icon={<Coins className="h-4 w-4 text-primary" />}
              title="Cheapest Item"
              itemName={summaryStats.cheapest.name}
              value={formatPrice(summaryStats.cheapest.lowestPrice)}
              subValue={`${formatNumber(summaryStats.cheapest.energy)} energy · ${summaryStats.cheapest.energyPerGold.toFixed(2)} E/G`}
              accentClass="border-primary/25 bg-primary/5"
            />
            <SummaryCard
              icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
              title="Average Efficiency"
              itemName={`Across ${filteredResults.length} items`}
              value={`${summaryStats.avgEfficiency.toFixed(1)}%`}
              subValue="Relative to best available deal"
              accentClass="border-blue-500/25 bg-blue-500/5"
            />
          </div>
        )}

        {/* Results Table */}
        <Card className="shadow-sm border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg flex items-center gap-2 font-mono">
                <Calculator className="h-5 w-5 text-primary" />
                Energy Efficiency Rankings
                <Badge variant="secondary" className="ml-1 font-mono">
                  {filteredResults.length} items
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono">
                  No energy items found matching your criteria.
                </p>
                <p className="text-sm font-mono mt-1">
                  Try adjusting your filters or check market availability.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {filteredResults.map((item, index) => (
                    <MobileResultCard
                      key={item.slug}
                      item={item}
                      rank={index + 1}
                    />
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block max-h-[min(70vh,720px)] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--border)]">
                      <TableRow className="hover:bg-transparent border-b border-border/80">
                        <SortableHeader
                          label="Rank"
                          sortKey="rank"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="w-[100px] pl-4"
                        />
                        <SortableHeader
                          label="Item"
                          sortKey="name"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="min-w-[160px]"
                        />
                        <SortableHeader
                          label="Energy"
                          sortKey="energy"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-center w-[90px]"
                        />
                        <SortableHeader
                          label="Price"
                          subLabel="(Gold)"
                          sortKey="price"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-right w-[90px]"
                        />
                        <SortableHeader
                          label="Energy/Gold"
                          sortKey="energyPerGold"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-right w-[110px]"
                        />
                        <TableHead className="text-right font-mono min-w-[150px] pr-4">
                          Efficiency
                        </TableHead>
                        <SortableHeader
                          label="Seller"
                          sortKey="seller"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-center min-w-[140px]"
                        />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((item, index) => {
                        const rank = index + 1;
                        const rankBadge = rank <= 3 ? RANK_BADGES[rank - 1] : null;

                        return (
                          <TableRow
                            key={item.slug}
                            className={cn(
                              "transition-all duration-200 border-b border-border/40",
                              getRankRowStyles(rank)
                            )}
                          >
                            <TableCell className="font-medium font-mono pl-4 py-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  {rank === 1 && (
                                    <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                                  )}
                                  {rank === 2 && (
                                    <Award className="h-4 w-4 text-slate-300 shrink-0" />
                                  )}
                                  {rank === 3 && (
                                    <Award className="h-4 w-4 text-orange-400 shrink-0" />
                                  )}
                                  <span className="font-bold tabular-nums">
                                    {rank}
                                  </span>
                                </div>
                                {rankBadge && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] w-fit font-mono border-primary/20 px-1.5"
                                  >
                                    {rankBadge.emoji} {rankBadge.label}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold font-mono py-3">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <span
                                className={cn(
                                  "font-bold tabular-nums",
                                  getEnergyColor(item.energy),
                                  "font-mono"
                                )}
                              >
                                {formatNumber(item.energy)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono py-3">
                              <span className="font-bold tabular-nums">
                                {formatPrice(item.lowestPrice)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono py-3">
                              <span className="font-bold text-chart-2 tabular-nums text-base">
                                {item.energyPerGold.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right py-3 pr-4">
                              <EfficiencyBar efficiency={item.efficiency} />
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <SellerCell
                                seller={item.seller}
                                url={item.url}
                                alternativeCount={item.alternativeCount}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <Alert className="bg-accent/10 border-accent/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-foreground font-mono">
                How to use this calculator:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>
                  • <strong>Energy per Gold</strong> shows how much energy you
                  get for 1 gold spent — higher is better
                </li>
                <li>
                  • <strong>Efficiency bars</strong> compare each item relative
                  to the best deal (100% = top ranked)
                </li>
                <li>
                  • Click column headers to sort; top 3 rows are highlighted
                  with gold, silver, and bronze accents
                </li>
                <li>
                  • Click on seller names to visit their market listings
                </li>
                <li>
                  • Use filters to narrow by tier, energy needs, budget, or
                  seller
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
