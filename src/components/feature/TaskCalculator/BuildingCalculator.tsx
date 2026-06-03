import {
  Fragment,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
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
  Search,
  Download,
  Sparkles,
  Crown,
  Award,
  Hammer,
  Store,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Package,
  AlertTriangle,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import * as XLSX from "xlsx";

interface MarketplaceItem {
  tile: { url: string; owner: string };
  object: {
    slug: string;
    category: string;
    subCategory: string;
    metadata: string | object;
    imageUrl: string;
    thumbnailImageUrl: string;
  };
  pricing: { unitPrice: number; availableQuantity?: number };
}

type Slug =
  | "anvil"
  | "barrel"
  | "bonfire"
  | "bread_oven"
  | "chicken_coop"
  | "dropbox"
  | "dyeing_vat"
  | "furnace_workbench"
  | "mill"
  | "sawmill_workbench"
  | "spinning_wheel"
  | "stonecutter_workbench"
  | "wine_press"
  | "ingot_iron"
  | "ingot_silver"
  | "stone_brick"
  | "clay_brick"
  | "wood_plank"
  | "wood"
  | "stone"
  | "clay"
  | "iron"
  | "silver"
  | "cotton";

type BaseResourceSlug =
  | "wood"
  | "stone"
  | "clay"
  | "iron"
  | "silver"
  | "cotton";

const BASE_RESOURCES: BaseResourceSlug[] = [
  "wood",
  "stone",
  "clay",
  "iron",
  "silver",
  "cotton",
];

interface RecipeInput {
  slug: Slug;
  qty: number;
}

interface Recipe {
  name: string;
  station: "Workbench" | "Furnace" | "Stonecutter" | "Sawmill";
  inputs: RecipeInput[];
  produces: number;
  category: "Structure" | "Processed";
}

const RECIPES: Record<Slug, Recipe> = {
  anvil: {
    name: "Anvil",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 200 },
      { slug: "ingot_iron", qty: 10 },
    ],
    produces: 1,
  },
  barrel: {
    name: "Barrel",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 15000 },
      { slug: "ingot_iron", qty: 15 },
    ],
    produces: 1,
  },
  bonfire: {
    name: "Bonfire",
    station: "Workbench",
    category: "Structure",
    inputs: [{ slug: "wood", qty: 100 }],
    produces: 1,
  },
  bread_oven: {
    name: "Bread Oven",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 10000 },
      { slug: "stone_brick", qty: 100000 },
      { slug: "clay_brick", qty: 200 },
    ],
    produces: 1,
  },
  chicken_coop: {
    name: "Chicken Coop",
    station: "Workbench",
    category: "Structure",
    inputs: [{ slug: "wood_plank", qty: 10000 }],
    produces: 1,
  },
  dropbox: {
    name: "Dropbox",
    station: "Workbench",
    category: "Structure",
    inputs: [{ slug: "wood_plank", qty: 10 }],
    produces: 1,
  },
  dyeing_vat: {
    name: "Dyeing Vat",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 500 },
      { slug: "stone_brick", qty: 1500 },
    ],
    produces: 1,
  },
  furnace_workbench: {
    name: "Furnace",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 1200 },
      { slug: "stone_brick", qty: 10000 },
      { slug: "clay_brick", qty: 200 },
    ],
    produces: 1,
  },
  mill: {
    name: "Mill",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 100000 },
      { slug: "stone_brick", qty: 10000 },
      { slug: "clay_brick", qty: 500 },
      { slug: "cotton", qty: 1000 },
    ],
    produces: 1,
  },
  sawmill_workbench: {
    name: "Sawmill",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood", qty: 50000 },
      { slug: "ingot_silver", qty: 100 },
    ],
    produces: 1,
  },
  spinning_wheel: {
    name: "Spinning Wheel",
    station: "Workbench",
    category: "Structure",
    inputs: [{ slug: "wood_plank", qty: 1500 }],
    produces: 1,
  },
  stonecutter_workbench: {
    name: "Stonecutter",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 100000 },
      { slug: "ingot_silver", qty: 100 },
    ],
    produces: 1,
  },
  wine_press: {
    name: "Wine Press",
    station: "Workbench",
    category: "Structure",
    inputs: [
      { slug: "wood_plank", qty: 5000 },
      { slug: "ingot_iron", qty: 5 },
    ],
    produces: 1,
  },
  ingot_iron: {
    name: "Iron Ingot",
    station: "Furnace",
    category: "Processed",
    inputs: [
      { slug: "wood", qty: 1 },
      { slug: "iron", qty: 1 },
    ],
    produces: 1,
  },
  ingot_silver: {
    name: "Silver Ingot",
    station: "Furnace",
    category: "Processed",
    inputs: [
      { slug: "wood", qty: 1 },
      { slug: "silver", qty: 1 },
    ],
    produces: 1,
  },
  stone_brick: {
    name: "Stone Brick",
    station: "Stonecutter",
    category: "Processed",
    inputs: [{ slug: "stone", qty: 1 }],
    produces: 3,
  },
  clay_brick: {
    name: "Clay Brick",
    station: "Stonecutter",
    category: "Processed",
    inputs: [{ slug: "clay", qty: 1 }],
    produces: 3,
  },
  wood_plank: {
    name: "Wood Plank",
    station: "Sawmill",
    category: "Processed",
    inputs: [{ slug: "wood", qty: 1 }],
    produces: 3,
  },
  wood: {
    name: "Wood",
    station: "Sawmill",
    category: "Processed",
    inputs: [],
    produces: 1,
  },
  stone: {
    name: "Stone",
    station: "Stonecutter",
    category: "Processed",
    inputs: [],
    produces: 1,
  },
  clay: {
    name: "Clay",
    station: "Stonecutter",
    category: "Processed",
    inputs: [],
    produces: 1,
  },
  iron: {
    name: "Iron",
    station: "Furnace",
    category: "Processed",
    inputs: [],
    produces: 1,
  },
  silver: {
    name: "Silver",
    station: "Furnace",
    category: "Processed",
    inputs: [],
    produces: 1,
  },
  cotton: {
    name: "Cotton",
    station: "Workbench",
    category: "Processed",
    inputs: [],
    produces: 1,
  },
};

const CRAFTABLE_TARGETS = Object.entries(RECIPES)
  .filter(([slug]) => !BASE_RESOURCES.includes(slug as BaseResourceSlug))
  .map(([slug, r]) => ({
    slug: slug as Slug,
    name: r.name,
    category: r.category,
  }));

const fmtGold = (v: number) => (isFinite(v) ? v.toFixed(4) : "—");

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatPrice(value: number): string {
  if (!isFinite(value)) return "—";
  if (value >= 1_000) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toFixed(2);
}

type CraftSortKey =
  | "rank"
  | "name"
  | "station"
  | "buyCost"
  | "craftCost"
  | "savings"
  | "recommendation";
type SortDirection = "asc" | "desc";
type RecommendationFilter = "all" | "Buy" | "Craft" | "Equal" | "Insufficient";

const RANK_BADGES = [
  { label: "Top Savings", emoji: "🏆" },
  { label: "Great Deal", emoji: "🥈" },
  { label: "Recommended", emoji: "🥉" },
] as const;

function getRankRowStyles(rank: number, insufficient: boolean) {
  if (insufficient) {
    return "border-l-[3px] border-l-destructive/60 bg-destructive/5 hover:bg-destructive/10";
  }
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

function getSavingsStyles(savingsPct: number) {
  if (savingsPct >= 50) {
    return {
      bar: "bg-emerald-500",
      glow: "shadow-[0_0_8px_rgba(16,185,129,0.4)]",
      text: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      label: "Excellent",
    };
  }
  if (savingsPct >= 25) {
    return {
      bar: "bg-blue-500",
      glow: "shadow-[0_0_8px_rgba(59,130,246,0.4)]",
      text: "text-blue-400",
      badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      label: "Good",
    };
  }
  if (savingsPct >= 10) {
    return {
      bar: "bg-yellow-500",
      glow: "shadow-[0_0_8px_rgba(234,179,8,0.35)]",
      text: "text-yellow-400",
      badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      label: "Fair",
    };
  }
  if (savingsPct > 0) {
    return {
      bar: "bg-zinc-400",
      glow: "",
      text: "text-zinc-400",
      badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
      label: "Low",
    };
  }
  return {
    bar: "bg-muted-foreground",
    glow: "",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    label: "None",
  };
}

function findMarketListings(marketData: MarketplaceItem[], slug: string) {
  const matches = marketData.filter(
    (i) => i.object.slug.toLowerCase() === slug.toLowerCase()
  );

  return matches
    .filter(
      (item) =>
        item.pricing.availableQuantity && item.pricing.availableQuantity > 0
    )
    .sort((a, b) => a.pricing.unitPrice - b.pricing.unitPrice);
}

function calculateActualCost(
  listings: MarketplaceItem[],
  neededQuantity: number
) {
  let remainingQty = neededQuantity;
  let totalCost = 0;
  const materialsUsed: Array<{
    seller: string;
    url: string;
    unitPrice: number;
    quantity: number;
    totalCost: number;
  }> = [];

  for (const listing of listings) {
    if (remainingQty <= 0) break;

    const availableQty = listing.pricing.availableQuantity || 0;
    const qtyToBuy = Math.min(remainingQty, availableQty);
    const costForThisListing = qtyToBuy * listing.pricing.unitPrice;

    totalCost += costForThisListing;
    remainingQty -= qtyToBuy;

    materialsUsed.push({
      seller: listing.tile.owner,
      url: listing.tile.url,
      unitPrice: listing.pricing.unitPrice,
      quantity: qtyToBuy,
      totalCost: costForThisListing,
    });

    if (remainingQty <= 0) break;
  }

  if (remainingQty > 0) {
    return {
      cost: Number.POSITIVE_INFINITY,
      materialsUsed,
      insufficientQty: remainingQty,
    };
  }

  return { cost: totalCost, materialsUsed, insufficientQty: 0 };
}

function accumulateBaseResources(
  product: Slug,
  neededUnits: number,
  acc: Partial<Record<BaseResourceSlug, number>>
): Partial<Record<BaseResourceSlug, number>> {
  const recipe = RECIPES[product];
  if (!recipe) return acc;

  if (BASE_RESOURCES.includes(product as BaseResourceSlug)) {
    const base = product as BaseResourceSlug;
    acc[base] = (acc[base] || 0) + neededUnits;
    return acc;
  }

  const produces = recipe.produces || 1;
  const batches = Math.ceil(neededUnits / produces);
  for (const input of recipe.inputs) {
    const totalInputNeeded = input.qty * batches;
    accumulateBaseResources(input.slug, totalInputNeeded, acc);
  }
  return acc;
}

function accumulateBuyAllMaterials(
  product: Slug,
  neededUnits: number,
  acc: Partial<Record<Slug, number>>
): Partial<Record<Slug, number>> {
  const recipe = RECIPES[product];
  if (!recipe) return acc;
  if (BASE_RESOURCES.includes(product as BaseResourceSlug)) {
    acc[product] = (acc[product] || 0) + neededUnits;
    return acc;
  }
  const produces = recipe.produces || 1;
  const batches = Math.ceil(neededUnits / produces);
  for (const input of recipe.inputs) {
    acc[input.slug] = (acc[input.slug] || 0) + input.qty * batches;
  }
  return acc;
}

interface MaterialBreakdown {
  slug: Slug;
  name: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  seller?: string;
  url?: string;
  alternatives?: number;
  insufficientQty?: number;
  materialsUsed?: Array<{
    seller: string;
    url: string;
    unitPrice: number;
    quantity: number;
    totalCost: number;
  }>;
}

interface ComputationBreakdown {
  buyMaterials: MaterialBreakdown[];
  craftMaterials: MaterialBreakdown[];
  buyInsufficient: boolean;
  craftInsufficient: boolean;
}

interface ComparisonRow {
  slug: Slug;
  name: string;
  category: string;
  station: string;
  buyCost: number;
  craftCost: number;
  savingsPct: number;
  savingsAmount: number;
  recommendation: "Buy" | "Craft" | "Equal" | "Insufficient";
  bestSeller?: string;
  bestUrl?: string;
  altCount?: number;
  qty: number;
  breakdown: ComputationBreakdown;
  buyInsufficient?: boolean;
  craftInsufficient?: boolean;
}

interface ExpandedRows {
  [key: string]: boolean;
}

function SavingsBar({
  savingsPct,
  maxSavings,
}: {
  savingsPct: number;
  maxSavings: number;
}) {
  const styles = getSavingsStyles(savingsPct);
  const relativeWidth =
    maxSavings > 0 ? Math.min(100, (savingsPct / maxSavings) * 100) : 0;

  return (
    <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
      <div className="flex items-center gap-2 w-full justify-end">
        <span className={cn("font-bold tabular-nums text-sm", styles.text)}>
          {savingsPct.toFixed(1)}%
        </span>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1.5 py-0 h-5 font-mono border",
            styles.badge
          )}
        >
          {styles.label}
        </Badge>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(savingsPct)}
        aria-valuemin={0}
        aria-valuemax={Math.round(maxSavings)}
        aria-label={`Savings ${savingsPct.toFixed(1)} percent`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            styles.bar,
            styles.glow
          )}
          style={{ width: `${relativeWidth}%` }}
        />
      </div>
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
  sortKey: CraftSortKey;
  currentSort: CraftSortKey;
  currentDirection: SortDirection;
  onSort: (key: CraftSortKey) => void;
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

export function CraftingCostComparator({
  marketData,
}: {
  marketData: MarketplaceItem[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBuyCost, setMaxBuyCost] = useState<number>(
    Number.POSITIVE_INFINITY
  );
  const [includeProcessed, setIncludeProcessed] = useState<boolean>(true);
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [minSavings, setMinSavings] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationFilter>("all");
  const [sortKey, setSortKey] = useState<CraftSortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const toggleRowExpansion = (slug: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const listingsCache = useMemo(() => {
    const cache = new Map<string, MarketplaceItem[]>();
    const allSlugs = [...Object.keys(RECIPES), ...BASE_RESOURCES];
    allSlugs.forEach((slug) => {
      cache.set(slug, findMarketListings(marketData, slug));
    });
    return cache;
  }, [marketData]);

  const stations = useMemo(() => {
    const stationTypes = [
      ...new Set(Object.values(RECIPES).map((r) => r.station)),
    ];
    return ["all", ...stationTypes];
  }, []);

  const filteredResults: ComparisonRow[] = useMemo(() => {
    const source = CRAFTABLE_TARGETS.filter((t) =>
      includeProcessed ? true : t.category !== "Processed"
    );

    const results: ComparisonRow[] = [];

    for (const t of source) {
      const targetSlug = t.slug;
      const targetName = RECIPES[targetSlug].name;
      const targetStation = RECIPES[targetSlug].station;
      const targetQty = Math.max(1, Math.floor(qty));

      // Calculate Buy-All breakdown with REAL quantities
      const buyNeeds = accumulateBuyAllMaterials(targetSlug, targetQty, {});
      let buyCost = 0;
      let buyInsufficient = false;
      const buyMaterials: MaterialBreakdown[] = [];

      for (const [matSlug, needed] of Object.entries(buyNeeds)) {
        const listings = listingsCache.get(matSlug) || [];
        const materialName = RECIPES[matSlug as Slug]?.name || matSlug;

        if (listings.length === 0) {
          buyCost = Number.POSITIVE_INFINITY;
          buyInsufficient = true;
          buyMaterials.push({
            slug: matSlug as Slug,
            name: materialName,
            quantity: needed,
            unitPrice: 0,
            totalCost: 0,
            insufficientQty: needed,
          });
          break;
        }

        const actualCost = calculateActualCost(listings, needed);

        if (!isFinite(actualCost.cost)) {
          buyCost = Number.POSITIVE_INFINITY;
          buyInsufficient = true;
          buyMaterials.push({
            slug: matSlug as Slug,
            name: materialName,
            quantity: needed,
            unitPrice: listings[0]?.pricing.unitPrice || 0,
            totalCost: 0,
            insufficientQty: actualCost.insufficientQty,
            materialsUsed: actualCost.materialsUsed,
          });
          break;
        }

        buyCost += actualCost.cost;

        buyMaterials.push({
          slug: matSlug as Slug,
          name: materialName,
          quantity: needed,
          unitPrice: actualCost.materialsUsed[0]?.unitPrice || 0,
          totalCost: actualCost.cost,
          seller: actualCost.materialsUsed[0]?.seller,
          url: actualCost.materialsUsed[0]?.url,
          alternatives: listings.length,
          materialsUsed: actualCost.materialsUsed,
        });
      }

      // Calculate Craft-from-Raw breakdown with REAL quantities
      const baseNeeds = accumulateBaseResources(targetSlug, targetQty, {});
      let craftCost = 0;
      let craftInsufficient = false;
      const craftMaterials: MaterialBreakdown[] = [];

      for (const [base, needed] of Object.entries(baseNeeds)) {
        const listings = listingsCache.get(base) || [];
        const materialName = RECIPES[base as Slug]?.name || base;

        if (listings.length === 0) {
          craftCost = Number.POSITIVE_INFINITY;
          craftInsufficient = true;
          craftMaterials.push({
            slug: base as Slug,
            name: materialName,
            quantity: needed,
            unitPrice: 0,
            totalCost: 0,
            insufficientQty: needed,
          });
          break;
        }

        const actualCost = calculateActualCost(listings, needed);

        if (!isFinite(actualCost.cost)) {
          craftCost = Number.POSITIVE_INFINITY;
          craftInsufficient = true;
          craftMaterials.push({
            slug: base as Slug,
            name: materialName,
            quantity: needed,
            unitPrice: listings[0]?.pricing.unitPrice || 0,
            totalCost: 0,
            insufficientQty: actualCost.insufficientQty,
            materialsUsed: actualCost.materialsUsed,
          });
          break;
        }

        craftCost += actualCost.cost;

        craftMaterials.push({
          slug: base as Slug,
          name: materialName,
          quantity: needed,
          unitPrice: actualCost.materialsUsed[0]?.unitPrice || 0,
          totalCost: actualCost.cost,
          seller: actualCost.materialsUsed[0]?.seller,
          url: actualCost.materialsUsed[0]?.url,
          alternatives: listings.length,
          materialsUsed: actualCost.materialsUsed,
        });
      }

      let recommendation: ComparisonRow["recommendation"] = "Equal";
      if (buyInsufficient && craftInsufficient) {
        recommendation = "Insufficient";
      } else if (buyInsufficient) {
        recommendation = "Craft";
      } else if (craftInsufficient) {
        recommendation = "Buy";
      } else if (craftCost < buyCost) {
        recommendation = "Craft";
      } else if (buyCost < craftCost) {
        recommendation = "Buy";
      }

      const savingsAmount = Math.abs(buyCost - craftCost);
      const savingsBase = Math.min(buyCost, craftCost);
      const costBase = Math.max(buyCost, craftCost);
      const savingsPct =
        isFinite(costBase) &&
        costBase > 0 &&
        !buyInsufficient &&
        !craftInsufficient
          ? ((costBase - savingsBase) / costBase) * 100
          : 0;

      // Find best seller from the first affordable material
      const firstAffordableMaterial = [...buyMaterials, ...craftMaterials].find(
        (m) => m.seller && m.url && !m.insufficientQty
      );

      results.push({
        slug: targetSlug,
        name: targetName,
        category: RECIPES[targetSlug].category,
        station: targetStation,
        buyCost,
        craftCost,
        savingsPct,
        savingsAmount,
        recommendation,
        bestSeller: firstAffordableMaterial?.seller,
        bestUrl: firstAffordableMaterial?.url,
        altCount: firstAffordableMaterial?.alternatives,
        qty: targetQty,
        buyInsufficient,
        craftInsufficient,
        breakdown: {
          buyMaterials: buyMaterials.sort((a, b) => b.totalCost - a.totalCost),
          craftMaterials: craftMaterials.sort(
            (a, b) => b.totalCost - a.totalCost
          ),
          buyInsufficient,
          craftInsufficient,
        },
      });
    }

    let filtered = results.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        r.savingsPct >= minSavings
    );

    if (isFinite(maxBuyCost)) {
      filtered = filtered.filter((r) => r.buyCost <= maxBuyCost);
    }

    if (selectedStation !== "all") {
      filtered = filtered.filter((r) => r.station === selectedStation);
    }

    if (selectedRecommendation !== "all") {
      filtered = filtered.filter(
        (r) => r.recommendation === selectedRecommendation
      );
    }

    return filtered;
  }, [
    searchTerm,
    maxBuyCost,
    includeProcessed,
    selectedStation,
    selectedRecommendation,
    minSavings,
    qty,
    listingsCache,
  ]);

  const maxSavingsPct = useMemo(() => {
    const valid = filteredResults.filter(
      (r) => r.recommendation !== "Insufficient" && isFinite(r.savingsPct)
    );
    return valid.length > 0
      ? Math.max(...valid.map((r) => r.savingsPct))
      : 0;
  }, [filteredResults]);

  const displayRows = useMemo(() => {
    const directionMultiplier = sortDirection === "asc" ? 1 : -1;

    const insufficientSort = (a: ComparisonRow, b: ComparisonRow) => {
      if (
        a.recommendation === "Insufficient" &&
        b.recommendation !== "Insufficient"
      )
        return 1;
      if (
        b.recommendation === "Insufficient" &&
        a.recommendation !== "Insufficient"
      )
        return -1;
      return 0;
    };

    return [...filteredResults].sort((a, b) => {
      const insufficient = insufficientSort(a, b);
      if (insufficient !== 0) return insufficient;

      switch (sortKey) {
        case "rank":
        case "savings":
          return (b.savingsPct - a.savingsPct) * directionMultiplier;
        case "name":
          return a.name.localeCompare(b.name) * directionMultiplier;
        case "station":
          return a.station.localeCompare(b.station) * directionMultiplier;
        case "buyCost":
          return (a.buyCost - b.buyCost) * directionMultiplier;
        case "craftCost":
          return (a.craftCost - b.craftCost) * directionMultiplier;
        case "recommendation":
          return (
            a.recommendation.localeCompare(b.recommendation) *
            directionMultiplier
          );
        default:
          return b.savingsPct - a.savingsPct;
      }
    });
  }, [filteredResults, sortKey, sortDirection]);

  const summaryStats = useMemo(() => {
    const available = filteredResults.filter(
      (r) => r.recommendation !== "Insufficient"
    );
    if (available.length === 0) return null;

    const topSavings = available.reduce((best, r) =>
      r.savingsPct > best.savingsPct ? r : best
    );
    const craftWins = available.filter((r) => r.recommendation === "Craft");
    const buyWins = available.filter((r) => r.recommendation === "Buy");
    const bestCraft =
      craftWins.length > 0
        ? craftWins.reduce((best, r) =>
            r.savingsAmount > best.savingsAmount ? r : best
          )
        : null;
    const bestBuy =
      buyWins.length > 0
        ? buyWins.reduce((best, r) =>
            r.savingsAmount > best.savingsAmount ? r : best
          )
        : null;
    const avgSavings =
      available.reduce((sum, r) => sum + r.savingsPct, 0) / available.length;

    return { topSavings, bestCraft, bestBuy, avgSavings, availableCount: available.length };
  }, [filteredResults]);

  const handleSort = useCallback(
    (key: CraftSortKey) => {
      if (sortKey === key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
    },
    [sortKey]
  );

  const topPicks = useMemo(() => displayRows.slice(0, 3), [displayRows]);

  const exportToExcel = () => {
    if (displayRows.length === 0) return;

    const data = displayRows.map((r, idx) => ({
      Rank: idx + 1,
      Item: r.name,
      Category: r.category,
      Station: r.station,
      Quantity: r.qty,
      "Buy Cost": isFinite(r.buyCost) ? r.buyCost : "Insufficient Stock",
      "Craft Cost": isFinite(r.craftCost) ? r.craftCost : "Insufficient Stock",
      "Savings %":
        r.recommendation === "Insufficient"
          ? "N/A"
          : `${r.savingsPct.toFixed(1)}%`,
      "Savings Amount": isFinite(r.savingsAmount) ? r.savingsAmount : "N/A",
      Recommendation: r.recommendation,
      "Buy Possible": !r.buyInsufficient,
      "Craft Possible": !r.craftInsufficient,
      "Best Seller": r.bestSeller || "N/A",
      "Alternative Sellers": r.altCount || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Crafting Comparison");

    const summary = [
      ["Crafting Cost Comparison", "", "", ""],
      ["Generated", new Date().toLocaleString(), "", ""],
      ["Items Analyzed", displayRows.length, "", ""],
      ["", "", "", ""],
      ["Top Picks"],
      ["Rank", "Item", "Best Option", "Savings %", "Savings Amount", "Status"],
      ...topPicks.map((r, i) => [
        i + 1,
        r.name,
        r.recommendation,
        r.recommendation === "Insufficient"
          ? "N/A"
          : `${r.savingsPct.toFixed(1)}%`,
        isFinite(r.savingsAmount) ? r.savingsAmount.toFixed(4) : "N/A",
        r.recommendation === "Insufficient"
          ? "Insufficient Materials"
          : "Available",
      ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");

    XLSX.writeFile(
      wb,
      `crafting-comparison-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const getBadge = (row: ComparisonRow) => {
    if (row.recommendation === "Insufficient") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Insufficient Stock
        </Badge>
      );
    }

    const savingsAmount = fmtGold(row.savingsAmount);

    if (row.recommendation === "Craft") {
      return (
        <Badge className="bg-chart-2 text-primary-foreground flex items-center gap-1 max-w-full">
          <Hammer className="h-3 w-3 shrink-0" />
          <span className="truncate">Craft (Save {savingsAmount})</span>
        </Badge>
      );
    }
    if (row.recommendation === "Buy") {
      return (
        <Badge className="bg-chart-1 text-primary-foreground flex items-center gap-1 max-w-full">
          <Store className="h-3 w-3 shrink-0" />
          <span className="truncate">Buy (Save {savingsAmount})</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Equal Cost
      </Badge>
    );
  };

  const MaterialBreakdownTable = ({
    materials,
    title,
    totalCost,
    insufficient,
  }: {
    materials: MaterialBreakdown[];
    title: string;
    totalCost: number;
    insufficient: boolean;
  }) => (
    <div className="mt-3 bg-muted/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm font-mono flex items-center gap-2">
          <Package className="h-4 w-4" />
          {title} - Total:{" "}
          {insufficient ? "Insufficient Stock" : `${formatPrice(totalCost)}`}
        </h4>
        {insufficient && <AlertTriangle className="h-4 w-4 text-destructive" />}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-mono text-xs">Material</TableHead>
            <TableHead className="text-right font-mono text-xs">
              Needed
            </TableHead>
            <TableHead className="text-right font-mono text-xs">
              Unit Price (Gold)
            </TableHead>
            <TableHead className="text-right font-mono text-xs">
              Total (Gold)
            </TableHead>
            <TableHead className="text-center font-mono text-xs">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material, index) => (
            <TableRow
              key={material.slug}
              className={index % 2 === 0 ? "bg-background/50" : ""}
            >
              <TableCell className="font-mono text-xs">
                {material.name}
              </TableCell>
              <TableCell className="text-right font-mono text-xs tabular-nums">
                {material.quantity > 0
                  ? formatNumber(material.quantity)
                  : "—"}
                {material.insufficientQty ? (
                  <div className="text-xs text-destructive">
                    (Missing: {formatNumber(material.insufficientQty)})
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="text-right font-mono text-xs tabular-nums">
                {material.unitPrice > 0 ? formatPrice(material.unitPrice) : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                {material.insufficientQty ? (
                  <span className="text-destructive">Insufficient</span>
                ) : (
                  formatPrice(material.totalCost)
                )}
              </TableCell>
              <TableCell className="text-center font-mono text-xs">
                {material.insufficientQty ? (
                  <Badge variant="destructive" className="text-xs">
                    Out of Stock
                  </Badge>
                ) : material.seller && material.url ? (
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {material.seller}
                    {material.alternatives && material.alternatives > 0 && (
                      <span className="text-accent ml-1">
                        (+{material.alternatives})
                      </span>
                    )}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Show detailed purchase breakdown for available materials */}
      {materials.some((m) => m.materialsUsed && m.materialsUsed.length > 0) && (
        <div className="mt-4">
          <h5 className="font-semibold text-xs font-mono mb-2">
            Detailed Purchase Breakdown:
          </h5>
          {materials
            .filter((m) => m.materialsUsed && m.materialsUsed.length > 0)
            .map((material) => (
              <div
                key={material.slug}
                className="mb-3 p-2 bg-background/50 rounded"
              >
                <div className="font-mono text-xs font-semibold mb-1">
                  {material.name}:
                </div>
                {material.materialsUsed!.map((purchase, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs font-mono ml-2"
                  >
                    <span>
                      {purchase.seller}: {purchase.quantity} ×{" "}
                      {fmtGold(purchase.unitPrice)}
                    </span>
                    <span>{fmtGold(purchase.totalCost)}</span>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-chart-2" />
            Crafting Cost Comparison
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={displayRows.length === 0}
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
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4",
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
                  placeholder="Search craftables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8 font-mono"
                />
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="station" className="font-mono text-sm">
                Crafting Station
              </Label>
              <Select
                value={selectedStation}
                onValueChange={setSelectedStation}
              >
                <SelectTrigger className="font-mono w-full">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem
                      key={station}
                      value={station}
                      className="font-mono"
                    >
                      {station === "all" ? "All Stations" : station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendation" className="font-mono text-sm">
                Recommendation
              </Label>
              <Select
                value={selectedRecommendation}
                onValueChange={(v) =>
                  setSelectedRecommendation(v as RecommendationFilter)
                }
              >
                <SelectTrigger className="font-mono w-full">
                  <SelectValue placeholder="All options" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "all",
                      "Craft",
                      "Buy",
                      "Equal",
                      "Insufficient",
                    ] as RecommendationFilter[]
                  ).map((option) => (
                    <SelectItem key={option} value={option} className="font-mono">
                      {option === "all" ? "All Options" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBuy" className="font-mono text-sm">
                Max Buy Cost
              </Label>
              <Input
                id="maxBuy"
                type="number"
                step="0.01"
                placeholder="No limit"
                onChange={(e) => {
                  const v = e.target.value.trim();
                  setMaxBuyCost(
                    v === "" ? Number.POSITIVE_INFINITY : Number(v)
                  );
                }}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty" className="font-mono text-sm">
                Quantity ({qty})
              </Label>
              <Input
                id="qty"
                type="range"
                min={1}
                max={100}
                step={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="font-mono w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minSavings" className="font-mono text-sm">
                Min Savings ({minSavings}%)
              </Label>
              <Input
                id="minSavings"
                type="range"
                min="0"
                max="100"
                step="1"
                value={minSavings}
                onChange={(e) => setMinSavings(Number(e.target.value))}
                className="font-mono w-full"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProcessed}
                  onChange={(e) => setIncludeProcessed(e.target.checked)}
                  className="rounded border-border"
                />
                Show processed items
              </label>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summaryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <SummaryCard
              icon={<Trophy className="h-4 w-4 text-amber-400" />}
              title="Top Savings"
              itemName={summaryStats.topSavings.name}
              value={`${summaryStats.topSavings.savingsPct.toFixed(1)}%`}
              subValue={`${summaryStats.topSavings.recommendation} · save ${formatPrice(summaryStats.topSavings.savingsAmount)} gold`}
              accentClass="border-amber-500/25 bg-amber-500/5"
            />
            <SummaryCard
              icon={<Hammer className="h-4 w-4 text-chart-2" />}
              title="Best Craft Deal"
              itemName={summaryStats.bestCraft?.name ?? "None available"}
              value={
                summaryStats.bestCraft
                  ? formatPrice(summaryStats.bestCraft.savingsAmount)
                  : "—"
              }
              subValue={
                summaryStats.bestCraft
                  ? `${summaryStats.bestCraft.savingsPct.toFixed(1)}% vs buy-all`
                  : "No craft wins in filter"
              }
              accentClass="border-chart-2/25 bg-chart-2/5"
            />
            <SummaryCard
              icon={<Store className="h-4 w-4 text-primary" />}
              title="Best Buy Deal"
              itemName={summaryStats.bestBuy?.name ?? "None available"}
              value={
                summaryStats.bestBuy
                  ? formatPrice(summaryStats.bestBuy.savingsAmount)
                  : "—"
              }
              subValue={
                summaryStats.bestBuy
                  ? `${summaryStats.bestBuy.savingsPct.toFixed(1)}% vs craft-from-raw`
                  : "No buy wins in filter"
              }
              accentClass="border-primary/25 bg-primary/5"
            />
            <SummaryCard
              icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
              title="Average Savings"
              itemName={`Across ${summaryStats.availableCount} items`}
              value={`${summaryStats.avgSavings.toFixed(1)}%`}
              subValue="Buy vs craft-from-raw comparison"
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
                Buy vs Craft Rankings
                <Badge variant="secondary" className="ml-1 font-mono">
                  {displayRows.length} items
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {displayRows.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Hammer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono">No items match your filters.</p>
                <p className="text-sm font-mono mt-1">
                  Try adjusting your filters or check market availability.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {displayRows.map((r, i) => {
                    const rank = i + 1;
                    const rankBadge = rank <= 3 ? RANK_BADGES[rank - 1] : null;
                    const insufficient = r.recommendation === "Insufficient";

                    return (
                      <Card
                        key={r.slug}
                        className={cn(
                          "overflow-hidden transition-all",
                          getRankRowStyles(rank, insufficient)
                        )}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-bold text-sm font-mono tabular-nums",
                                  insufficient && "bg-destructive/20 text-destructive",
                                  !insufficient && rank === 1 && "bg-amber-500/20 text-amber-400",
                                  !insufficient && rank === 2 && "bg-slate-400/20 text-slate-300",
                                  !insufficient && rank === 3 && "bg-orange-500/20 text-orange-400",
                                  !insufficient && rank > 3 && "bg-muted text-muted-foreground"
                                )}
                              >
                                {rank}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold font-mono truncate">
                                  {r.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {r.station}
                                </p>
                                {rankBadge && !insufficient && (
                                  <Badge
                                    variant="outline"
                                    className="mt-1 text-[10px] font-mono border-primary/20"
                                  >
                                    {rankBadge.emoji} {rankBadge.label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0">{getBadge(r)}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                            <div>
                              <span className="text-[10px] uppercase text-muted-foreground">
                                Buy-All (Gold)
                              </span>
                              <p className="font-bold tabular-nums">
                                {r.buyInsufficient
                                  ? "Insufficient"
                                  : formatPrice(r.buyCost)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase text-muted-foreground">
                                Craft (Gold)
                              </span>
                              <p className="font-bold tabular-nums">
                                {r.craftInsufficient
                                  ? "Insufficient"
                                  : formatPrice(r.craftCost)}
                              </p>
                            </div>
                          </div>

                          {!insufficient && (
                            <SavingsBar
                              savingsPct={r.savingsPct}
                              maxSavings={maxSavingsPct}
                            />
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRowExpansion(r.slug)}
                            className="w-full font-mono text-xs"
                          >
                            {expandedRows[r.slug] ? (
                              <>
                                Hide breakdown{" "}
                                <ChevronUp className="h-3 w-3 ml-1" />
                              </>
                            ) : (
                              <>
                                View breakdown{" "}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </Button>

                          {expandedRows[r.slug] && (
                            <div className="space-y-3 pt-2 border-t border-border/50">
                              <MaterialBreakdownTable
                                materials={r.breakdown.buyMaterials}
                                title="Buy-All Materials"
                                totalCost={r.buyCost}
                                insufficient={r.buyInsufficient || false}
                              />
                              <MaterialBreakdownTable
                                materials={r.breakdown.craftMaterials}
                                title="Craft-from-Raw Materials"
                                totalCost={r.craftCost}
                                insufficient={r.craftInsufficient || false}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block max-h-[min(70vh,720px)] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--border)]">
                      <TableRow className="hover:bg-transparent border-b border-border/80">
                        <TableHead className="font-mono w-10 pl-3" />
                        <SortableHeader
                          label="Rank"
                          sortKey="rank"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="w-[100px]"
                        />
                        <SortableHeader
                          label="Item"
                          sortKey="name"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="min-w-[140px]"
                        />
                        <SortableHeader
                          label="Station"
                          sortKey="station"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="min-w-[100px]"
                        />
                        <SortableHeader
                          label="Buy-All"
                          subLabel="(Gold)"
                          sortKey="buyCost"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-right w-[100px]"
                        />
                        <SortableHeader
                          label="Craft"
                          subLabel="(Gold)"
                          sortKey="craftCost"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-right w-[100px]"
                        />
                        <SortableHeader
                          label="Best"
                          sortKey="recommendation"
                          currentSort={sortKey}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                          className="text-center min-w-[140px]"
                        />
                        <TableHead className="text-right font-mono min-w-[150px] pr-4">
                          Savings
                        </TableHead>
                        <TableHead className="text-center font-mono min-w-[100px]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayRows.map((r, i) => {
                        const rank = i + 1;
                        const rankBadge = rank <= 3 ? RANK_BADGES[rank - 1] : null;
                        const insufficient = r.recommendation === "Insufficient";

                        return (
                          <Fragment key={r.slug}>
                            <TableRow
                              className={cn(
                                "transition-all duration-200 border-b border-border/40",
                                getRankRowStyles(rank, insufficient)
                              )}
                            >
                              <TableCell className="w-10 pl-3 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRowExpansion(r.slug)}
                                  className="h-8 w-8 p-0"
                                  aria-label={
                                    expandedRows[r.slug]
                                      ? "Collapse breakdown"
                                      : "Expand breakdown"
                                  }
                                >
                                  {expandedRows[r.slug] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium font-mono py-3">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    {!insufficient && rank === 1 && (
                                      <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                                    )}
                                    {!insufficient && rank === 2 && (
                                      <Award className="h-4 w-4 text-slate-300 shrink-0" />
                                    )}
                                    {!insufficient && rank === 3 && (
                                      <Award className="h-4 w-4 text-orange-400 shrink-0" />
                                    )}
                                    {insufficient && (
                                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                    )}
                                    <span className="font-bold tabular-nums">
                                      {rank}
                                    </span>
                                  </div>
                                  {rankBadge && !insufficient && (
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
                                {r.name}
                              </TableCell>
                              <TableCell className="font-mono text-sm py-3">
                                {r.station}
                              </TableCell>
                              <TableCell className="text-right font-mono py-3">
                                {r.buyInsufficient ? (
                                  <span className="text-destructive text-sm">
                                    Insufficient
                                  </span>
                                ) : (
                                  <span className="font-bold tabular-nums">
                                    {formatPrice(r.buyCost)}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono py-3">
                                {r.craftInsufficient ? (
                                  <span className="text-destructive text-sm">
                                    Insufficient
                                  </span>
                                ) : (
                                  <span className="font-bold tabular-nums">
                                    {formatPrice(r.craftCost)}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center py-3">
                                <div className="flex justify-center">
                                  {getBadge(r)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-3 pr-4">
                                {insufficient ? (
                                  <span className="text-muted-foreground font-mono">
                                    —
                                  </span>
                                ) : (
                                  <SavingsBar
                                    savingsPct={r.savingsPct}
                                    maxSavings={maxSavingsPct}
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-center py-3">
                                {r.buyInsufficient && r.craftInsufficient ? (
                                  <Badge variant="destructive" className="text-xs">
                                    No Stock
                                  </Badge>
                                ) : r.buyInsufficient ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-amber-500/20"
                                  >
                                    Craft Only
                                  </Badge>
                                ) : r.craftInsufficient ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-500/20"
                                  >
                                    Buy Only
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-500/20"
                                  >
                                    Both Available
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                            {expandedRows[r.slug] && (
                              <TableRow>
                                <TableCell colSpan={9} className="p-0 border-b-0">
                                  <div className="bg-muted/20 p-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      <MaterialBreakdownTable
                                        materials={r.breakdown.buyMaterials}
                                        title="Buy-All Materials"
                                        totalCost={r.buyCost}
                                        insufficient={r.buyInsufficient || false}
                                      />
                                      <MaterialBreakdownTable
                                        materials={r.breakdown.craftMaterials}
                                        title="Craft-from-Raw Materials"
                                        totalCost={r.craftCost}
                                        insufficient={r.craftInsufficient || false}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
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
                Real Stock Analysis:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>
                  • <strong>Buy-All</strong> vs <strong>Craft-from-Raw</strong>{" "}
                  compares buying finished materials vs buying base resources
                </li>
                <li>
                  • <strong>Savings bars</strong> show relative savings — green
                  means excellent value from the cheaper option
                </li>
                <li>
                  • Click column headers to sort; top 3 rows get gold, silver,
                  and bronze accents
                </li>
                <li>
                  • Expand any row to see the full material breakdown with real
                  stock quantities
                </li>
                <li>
                  • Calculations use <strong>actual market availability</strong>,
                  not just lowest listed prices
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
