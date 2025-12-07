import { Fragment, useMemo, useState } from "react";
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
  Package,
  AlertTriangle,
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

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

  const rows: ComparisonRow[] = useMemo(() => {
    setIsCalculating(true);

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

    filtered.sort((a, b) => {
      // Sort by availability first, then savings
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

      const s = b.savingsPct - a.savingsPct;
      if (s !== 0) return s;
      return (
        (a.recommendation === "Craft" ? a.craftCost : a.buyCost) -
        (b.recommendation === "Craft" ? b.craftCost : b.buyCost)
      );
    });

    setIsCalculating(false);
    return filtered;
  }, [
    searchTerm,
    maxBuyCost,
    includeProcessed,
    selectedStation,
    minSavings,
    qty,
    listingsCache,
  ]);

  const topPicks = useMemo(() => rows.slice(0, 3), [rows]);

  const exportToExcel = () => {
    if (rows.length === 0) return;

    const data = rows.map((r, idx) => ({
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
      ["Items Analyzed", rows.length, "", ""],
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
          {insufficient ? "Insufficient Stock" : `${fmtGold(totalCost)} gold`}
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
              Unit Price
            </TableHead>
            <TableHead className="text-right font-mono text-xs">
              Total Cost
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
              <TableCell className="text-right font-mono text-xs">
                {material.quantity}
                {material.insufficientQty && (
                  <div className="text-xs text-destructive">
                    (Missing: {material.insufficientQty})
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {material.unitPrice > 0 ? fmtGold(material.unitPrice) : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs font-semibold">
                {material.insufficientQty ? (
                  <span className="text-destructive">Insufficient</span>
                ) : (
                  fmtGold(material.totalCost)
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
            <Calculator className="h-5 w-5 text-primary" />
            Crafting Cost Comparison (Real Stock)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={rows.length === 0}
            className="flex items-center gap-1 font-mono"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
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
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxBuy" className="font-mono text-sm">
              Max Buy Cost ({isFinite(maxBuyCost) ? fmtGold(maxBuyCost) : "∞"})
            </Label>
            <Input
              id="maxBuy"
              type="number"
              step="0.01"
              placeholder="No limit"
              onChange={(e) => {
                const v = e.target.value.trim();
                setMaxBuyCost(v === "" ? Number.POSITIVE_INFINITY : Number(v));
              }}
              className="font-mono"
            />
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
                  <SelectItem key={station} value={station} className="font-mono">
                  {station === "all" ? "All Stations" : station}
                  </SelectItem>
              ))}
              </SelectContent>
            </Select>
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

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-mono">
              <input
                type="checkbox"
                checked={includeProcessed}
                onChange={(e) => setIncludeProcessed(e.target.checked)}
              />
              Show processed items
            </label>
          </div>
        </div>

        {/* Loading State */}
        {isCalculating && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 font-mono">
              Calculating real costs based on available stock...
            </span>
          </div>
        )}

        {/* Top Recommendations */}
        {topPicks.length > 0 && !isCalculating && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPicks.map((r, i) => (
              <Card
                key={r.slug}
                className={`border-accent/20 shadow-sm ${
                  r.recommendation === "Insufficient"
                    ? "bg-destructive/10"
                    : "bg-accent/10"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && r.recommendation !== "Insufficient" && (
                        <Crown className="h-5 w-5 text-chart-2" />
                      )}
                      {i === 1 && r.recommendation !== "Insufficient" && (
                        <Award className="h-5 w-5 text-chart-1" />
                      )}
                      {i === 2 && r.recommendation !== "Insufficient" && (
                        <Award className="h-5 w-5 text-chart-3" />
                      )}
                      {r.recommendation === "Insufficient" && (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <h3 className="font-bold text-lg font-mono">{r.name}</h3>
                    </div>
                    <Badge
                      className={
                        r.recommendation === "Insufficient"
                          ? "bg-destructive text-primary-foreground font-mono"
                          : "bg-chart-2 text-primary-foreground font-mono"
                      }
                    >
                      #{i + 1}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm font-mono">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-muted-foreground shrink-0">
                        Recommendation:
                      </span>
                      <span className="font-semibold min-w-0 flex justify-end">
                        {getBadge(r)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy-All:</span>
                      <span className="font-semibold">
                        {r.buyInsufficient
                          ? "Insufficient Stock"
                          : `${fmtGold(r.buyCost)} gold`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Craft-from-Raw:
                      </span>
                      <span className="font-semibold">
                        {r.craftInsufficient
                          ? "Insufficient Stock"
                          : `${fmtGold(r.craftCost)} gold`}
                      </span>
                    </div>
                    {r.recommendation !== "Insufficient" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Savings:</span>
                        <span className="font-semibold">
                          {r.savingsPct.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Station:</span>
                      <span className="font-semibold">{r.station}</span>
                    </div>
                  </div>

                  {r.bestSeller &&
                    r.bestUrl &&
                    !r.buyInsufficient &&
                    !r.craftInsufficient && (
                      <div className="mt-2 text-xs text-muted-foreground font-mono">
                        Cheapest input:{" "}
                        <a
                          href={r.bestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {r.bestSeller}
                        </a>
                        {typeof r.altCount === "number" && r.altCount > 0 && (
                          <span className="ml-1 text-accent">
                            {" "}
                            (+{r.altCount})
                          </span>
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 font-mono">
                <Calculator className="h-5 w-5 text-primary" />
                Buy vs Craft — Real Stock Analysis
                <Badge variant="secondary" className="ml-2 font-mono">
                  {rows.length} items
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {rows.length === 0 && !isCalculating ? (
              <div className="p-8 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono">No items match your filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono w-8"></TableHead>
                    <TableHead className="font-mono">Rank</TableHead>
                    <TableHead className="font-mono">Item</TableHead>
                    <TableHead className="font-mono">Station</TableHead>
                    <TableHead className="text-right font-mono">
                      Buy-All
                    </TableHead>
                    <TableHead className="text-right font-mono">
                      Craft-from-Raw
                    </TableHead>
                    <TableHead className="text-center font-mono">
                      Best
                    </TableHead>
                    <TableHead className="text-center font-mono">
                      Savings
                    </TableHead>
                    <TableHead className="text-center font-mono">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <Fragment key={r.slug}>
                      <TableRow
                        className={
                          r.recommendation === "Insufficient"
                            ? "bg-destructive/10"
                            : i < 3
                            ? "bg-accent/5"
                            : ""
                        }
                      >
                        <TableCell className="w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(r.slug)}
                            className="h-8 w-8 p-0"
                          >
                            {expandedRows[r.slug] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          <div className="flex items-center gap-2">
                            {i === 0 && r.recommendation !== "Insufficient" && (
                              <Crown className="h-4 w-4 text-chart-2" />
                            )}
                            {i === 1 && r.recommendation !== "Insufficient" && (
                              <Award className="h-4 w-4 text-chart-1" />
                            )}
                            {i === 2 && r.recommendation !== "Insufficient" && (
                              <Award className="h-4 w-4 text-chart-3" />
                            )}
                            {r.recommendation === "Insufficient" && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            {i + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {r.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {r.station}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {r.buyInsufficient ? (
                            <span className="text-destructive">
                              Insufficient
                            </span>
                          ) : (
                            <>
                              {fmtGold(r.buyCost)}
                              <div className="text-xs text-muted-foreground">
                                gold
                              </div>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {r.craftInsufficient ? (
                            <span className="text-destructive">
                              Insufficient
                            </span>
                          ) : (
                            <>
                              {fmtGold(r.craftCost)}
                              <div className="text-xs text-muted-foreground">
                                gold
                              </div>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-center max-w-[200px]">
                          <div className="flex justify-center">
                          {getBadge(r)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {r.recommendation === "Insufficient"
                            ? "—"
                            : isFinite(r.savingsPct)
                            ? `${r.savingsPct.toFixed(1)}%`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-center font-mono">
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
                  ))}
                </TableBody>
              </Table>
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
                  • <strong>Now considers available quantities</strong> - if
                  there are only 734 stones at 0.15 gold, the rest will be
                  bought at higher prices
                </li>
                <li>
                  • <strong>Red badges</strong> indicate items that cannot be
                  crafted/bought due to insufficient materials
                </li>
                <li>
                  • <strong>Detailed breakdowns</strong> show exactly which
                  sellers and prices will be used
                </li>
                <li>
                  • Calculations now reflect{" "}
                  <strong>real market availability</strong>, not just lowest
                  theoretical prices
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
