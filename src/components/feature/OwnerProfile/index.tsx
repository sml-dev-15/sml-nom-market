"use client";

import {
  Fragment,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  ShoppingCart,
  Package,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Crown,
  Award,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
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
    metadata: {
      title?: string;
    };
    imageUrl?: string;
    thumbnailImageUrl?: string;
  };
  pricing: {
    unitPrice: number;
    availableQuantity?: number;
    desiredQuantity?: number;
  };
}

interface NormalizedListing {
  direction: "SELL" | "BUY";
  owner: string;
  tileUrl: string;
  slug: string;
  category: string;
  subCategory: string;
  unitPrice: number;
  quantity: number;
  itemName: string;
  imageUrl?: string;
  thumbnailImageUrl?: string;
}

interface OwnerProfileViewProps {
  ownerId: string;
}

interface ListingGroup {
  slug: string;
  itemName: string;
  category: string;
  subCategory: string;
  imageUrl?: string;
  thumbnailImageUrl?: string;
  totalQuantity: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  listings: NormalizedListing[];
  tileCount: number;
}

type ListingSortKey = "rank" | "name" | "price" | "quantity" | "category";
type SortDirection = "asc" | "desc";

const RANK_BADGES = [
  { label: "Best Price", emoji: "ðŸ†" },
  { label: "Great Deal", emoji: "ðŸ¥ˆ" },
  { label: "Good Value", emoji: "ðŸ¥‰" },
] as const;

const PROFILE_TABS = {
  sell: {
    title: "Wants to Buy",
    quantityLabel: "Desired",
    icon: ShoppingCart,
  },
  buy: {
    title: "For Sale",
    quantityLabel: "Quantity",
    icon: Package,
  },
} as const;

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatPrice(value: number): string {
  if (!isFinite(value)) return "â€”";
  if (value >= 1_000) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toFixed(2);
}

function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
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
  sortKey: ListingSortKey;
  currentSort: ListingSortKey;
  currentDirection: SortDirection;
  onSort: (key: ListingSortKey) => void;
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

export function OwnerProfileView({ ownerId }: OwnerProfileViewProps) {
  const [marketplaceData, setMarketplaceData] = useState<{
    toBuy: MarketplaceItem[];
    toSell: MarketplaceItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("buy");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortKey, setSortKey] = useState<ListingSortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [groupByItem, setGroupByItem] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Fetch marketplace data
  const fetchMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.nomstead.com/open/marketplace");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMarketplaceData({
        toBuy: data.toBuy || [],
        toSell: data.toSell || [],
      });
    } catch (err) {
      console.error("API error:", err);
      setError(
        err instanceof Error
          ? `Failed to load marketplace data: ${err.message}`
          : "Failed to load marketplace data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when ownerId changes
  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData, ownerId]);

  // Normalize and filter listings
  const ownerListings = useMemo(() => {
    if (!marketplaceData) return { sell: [], buy: [] };

    const normalizeListings = (
      items: MarketplaceItem[],
      direction: "SELL" | "BUY"
    ): NormalizedListing[] => {
      return items
        .filter((item) => item.tile.owner.toLowerCase() === ownerId.toLowerCase())
        .map((item) => ({
          direction,
          owner: item.tile.owner,
          tileUrl: item.tile.url,
          slug: item.object.slug,
          category: item.object.category,
          subCategory: item.object.subCategory,
          unitPrice: item.pricing.unitPrice,
          quantity:
            direction === "SELL"
              ? item.pricing.desiredQuantity || 0
              : item.pricing.availableQuantity || 0,
          itemName: item.object.metadata?.title || item.object.slug,
          imageUrl: item.object.imageUrl,
          thumbnailImageUrl: item.object.thumbnailImageUrl,
        }));
    };

    return {
      sell: normalizeListings(marketplaceData.toSell, "SELL"),
      buy: normalizeListings(marketplaceData.toBuy, "BUY"),
    };
  }, [marketplaceData, ownerId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const allListings = [...ownerListings.sell, ...ownerListings.buy];
    const uniqueTiles = new Set(allListings.map((l) => l.tileUrl));
    const uniqueSellItems = new Set(ownerListings.sell.map((l) => l.slug));
    const uniqueBuyItems = new Set(ownerListings.buy.map((l) => l.slug));

    // Determine specialization
    const categoryCounts = new Map<string, number>();
    ownerListings.sell.forEach((listing) => {
      categoryCounts.set(
        listing.category,
        (categoryCounts.get(listing.category) || 0) + 1
      );
    });

    let specialization = "General Trader";
    if (categoryCounts.size > 0) {
      const topCategory = Array.from(categoryCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0];
      if (topCategory[1] >= ownerListings.sell.length * 0.5) {
        specialization = `${topCategory[0]} Merchant`;
      }
    }

    return {
      tilesOnMarket: uniqueTiles.size,
      activeSellListings: ownerListings.sell.length,
      activeBuyListings: ownerListings.buy.length,
      uniqueItemsSold: uniqueSellItems.size,
      uniqueItemsBought: uniqueBuyItems.size,
      specialization,
    };
  }, [ownerListings]);

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const listings = activeTab === "sell" ? ownerListings.sell : ownerListings.buy;
    const cats = [...new Set(listings.map((l) => l.category))].filter(Boolean);
    return cats.sort();
  }, [ownerListings, activeTab]);

  const subCategories = useMemo(() => {
    const listings = activeTab === "sell" ? ownerListings.sell : ownerListings.buy;
    if (selectedCategory === "all") {
      const subCats = [...new Set(listings.map((l) => l.subCategory))].filter(
        Boolean
      );
      return subCats.sort();
    }
    const subCats = [
      ...new Set(
        listings
          .filter((l) => l.category === selectedCategory)
          .map((l) => l.subCategory)
      ),
    ].filter(Boolean);
    return subCats.sort();
  }, [ownerListings, activeTab, selectedCategory]);

  // Filter listings (sort applied separately)
  const filteredListings = useMemo(() => {
    const listings = activeTab === "sell" ? ownerListings.sell : ownerListings.buy;

    return listings.filter((listing) => {
      const matchesSearch =
        searchTerm === "" ||
        listing.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || listing.category === selectedCategory;
      const matchesSubCategory =
        selectedSubCategory === "all" ||
        listing.subCategory === selectedSubCategory;

      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [
    ownerListings,
    activeTab,
    searchTerm,
    selectedCategory,
    selectedSubCategory,
  ]);

  // Group listings by item slug if enabled
  const groupedListings = useMemo(() => {
    if (!groupByItem) return null;

    const groups = new Map<string, NormalizedListing[]>();
    filteredListings.forEach((listing) => {
      const key = listing.slug;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(listing);
    });

    return Array.from(groups.entries()).map(([slug, listings]) => {
      const totalQuantity = listings.reduce((sum, l) => sum + l.quantity, 0);
      const prices = listings.map((l) => l.unitPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice =
        prices.reduce((sum, p) => sum + p, 0) / prices.length;

      return {
        slug,
        itemName: listings[0].itemName,
        category: listings[0].category,
        subCategory: listings[0].subCategory,
        imageUrl: listings[0].imageUrl,
        thumbnailImageUrl: listings[0].thumbnailImageUrl,
        totalQuantity,
        minPrice,
        maxPrice,
        avgPrice,
        listings,
        tileCount: listings.length,
      };
    });
  }, [filteredListings, groupByItem]);

  const listingGroups: ListingGroup[] = useMemo(() => {
    if (groupByItem && groupedListings) {
      return groupedListings;
    }

    return filteredListings.map((listing) => ({
      slug: listing.slug,
      itemName: listing.itemName,
      category: listing.category,
      subCategory: listing.subCategory,
      imageUrl: listing.imageUrl,
      thumbnailImageUrl: listing.thumbnailImageUrl,
      listings: [listing],
      tileCount: 1,
      totalQuantity: listing.quantity,
      minPrice: listing.unitPrice,
      maxPrice: listing.unitPrice,
      avgPrice: listing.unitPrice,
    }));
  }, [filteredListings, groupByItem, groupedListings]);

  const displayListings = useMemo(() => {
    const directionMultiplier = sortDirection === "asc" ? 1 : -1;

    return [...listingGroups].sort((a, b) => {
      switch (sortKey) {
        case "rank":
        case "price":
          return (a.minPrice - b.minPrice) * directionMultiplier;
        case "quantity":
          return (a.totalQuantity - b.totalQuantity) * directionMultiplier;
        case "category":
          return a.category.localeCompare(b.category) * directionMultiplier;
        case "name":
          return a.itemName.localeCompare(b.itemName) * directionMultiplier;
        default:
          return a.minPrice - b.minPrice;
      }
    });
  }, [listingGroups, sortKey, sortDirection]);

  const listingSummary = useMemo(() => {
    if (displayListings.length === 0) return null;

    const cheapest = displayListings.reduce((best, item) =>
      item.minPrice < best.minPrice ? item : best
    );
    const largestQty = displayListings.reduce((best, item) =>
      item.totalQuantity > best.totalQuantity ? item : best
    );
    const avgPrice =
      displayListings.reduce((sum, item) => sum + item.avgPrice, 0) /
      displayListings.length;

    return { cheapest, largestQty, avgPrice };
  }, [displayListings]);

  const handleSort = useCallback(
    (key: ListingSortKey) => {
      if (sortKey === key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection(key === "rank" || key === "price" ? "asc" : "asc");
      }
    },
    [sortKey]
  );

  const toggleRowExpansion = (slug: string) => {
    setExpandedRows((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSubCategory("all");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("all");
  };

  const TabIcon = PROFILE_TABS[activeTab].icon;
  const totalTabListings =
    activeTab === "sell"
      ? ownerListings.sell.length
      : ownerListings.buy.length;

  const renderListingsContent = () => {
    if (displayListings.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <TabIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-mono">
            No {PROFILE_TABS[activeTab].title.toLowerCase()} listings found
            {searchTerm || selectedCategory !== "all" ? " matching your filters" : ""}.
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4 font-mono"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {displayListings.map((group, index) => {
            const rank = index + 1;
            const rankBadge = rank <= 3 ? RANK_BADGES[rank - 1] : null;
            const rowKey = `${group.slug}-${index}`;
            const canExpand = groupByItem && group.tileCount > 1;

            return (
              <Card
                key={rowKey}
                className={cn(
                  "overflow-hidden transition-all",
                  getRankRowStyles(rank)
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {group.thumbnailImageUrl && (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden border border-border shrink-0">
                        <Image
                          src={group.thumbnailImageUrl}
                          alt={group.itemName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-bold text-xs font-mono tabular-nums",
                              rank === 1 && "bg-amber-500/20 text-amber-400",
                              rank === 2 && "bg-slate-400/20 text-slate-300",
                              rank === 3 && "bg-orange-500/20 text-orange-400",
                              rank > 3 && "bg-muted text-muted-foreground"
                            )}
                          >
                            {rank}
                          </span>
                          <p className="font-bold font-mono truncate text-sm">
                            {group.itemName}
                          </p>
                        </div>
                      </div>
                      {rankBadge && (
                        <Badge
                          variant="outline"
                          className="mt-1 text-[10px] font-mono border-primary/20"
                        >
                          {rankBadge.emoji} {rankBadge.label}
                        </Badge>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {group.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {group.subCategory}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        Price (Gold)
                      </span>
                      <p className="font-bold tabular-nums">
                        {formatPriceRange(group.minPrice, group.maxPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {PROFILE_TABS[activeTab].quantityLabel}
                      </span>
                      <p className="font-bold tabular-nums">
                        {formatNumber(group.totalQuantity)}
                      </p>
                    </div>
                  </div>

                  {canExpand ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRowExpansion(rowKey)}
                        className="w-full font-mono text-xs"
                      >
                        {expandedRows[rowKey] ? "Hide tiles" : "View tiles"}{" "}
                        ({group.tileCount})
                        {expandedRows[rowKey] ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                      {expandedRows[rowKey] && (
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          {group.listings.map((listing, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs font-mono p-2 rounded-md bg-muted/30"
                            >
                              <span className="tabular-nums">
                                {formatNumber(listing.quantity)} @{" "}
                                {formatPrice(listing.unitPrice)}
                              </span>
                              <a
                                href={listing.tileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Button variant="outline" size="sm" asChild className="w-full font-mono text-xs">
                      <a
                        href={group.listings[0].tileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        View Tile
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
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
                {groupByItem && (
                  <TableHead className="font-mono w-10 pl-3" />
                )}
                <SortableHeader
                  label="Rank"
                  sortKey="rank"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="w-[90px] pl-3"
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
                  label="Category"
                  sortKey="category"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="min-w-[100px]"
                />
                <SortableHeader
                  label="Price"
                  subLabel="(Gold)"
                  sortKey="price"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="text-right w-[110px]"
                />
                <SortableHeader
                  label={PROFILE_TABS[activeTab].quantityLabel}
                  sortKey="quantity"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="text-right w-[100px]"
                />
                <TableHead className="text-center font-mono min-w-[90px]">
                  Tiles
                </TableHead>
                <TableHead className="text-center font-mono w-[100px] pr-4">
                  Link
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayListings.map((group, index) => {
                const rank = index + 1;
                const rankBadge = rank <= 3 ? RANK_BADGES[rank - 1] : null;
                const rowKey = `${group.slug}-${index}`;
                const canExpand = groupByItem && group.tileCount > 1;

                return (
                  <Fragment key={rowKey}>
                    <TableRow
                      className={cn(
                        "transition-all duration-200 border-b border-border/40",
                        getRankRowStyles(rank)
                      )}
                    >
                      {groupByItem && (
                        <TableCell className="w-10 pl-3 py-3">
                          {canExpand ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(rowKey)}
                              className="h-8 w-8 p-0"
                            >
                              {expandedRows[rowKey] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                        </TableCell>
                      )}
                      <TableCell className="font-medium font-mono py-3 pl-3">
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
                            <span className="font-bold tabular-nums">{rank}</span>
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
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {group.thumbnailImageUrl && (
                            <div className="relative w-9 h-9 rounded-md overflow-hidden border border-border shrink-0">
                              <Image
                                src={group.thumbnailImageUrl}
                                alt={group.itemName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold font-mono truncate">
                              {group.itemName}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                              {group.subCategory}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm py-3">
                        {group.category}
                      </TableCell>
                      <TableCell className="text-right font-mono py-3">
                        <span className="font-bold tabular-nums">
                          {formatPriceRange(group.minPrice, group.maxPrice)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono py-3">
                        <span className="font-bold tabular-nums">
                          {formatNumber(group.totalQuantity)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono py-3">
                        <Badge variant="outline" className="text-xs font-mono tabular-nums">
                          {group.tileCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-3 pr-4">
                        <a
                          href={group.listings[0].tileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-mono"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                    {canExpand && expandedRows[rowKey] && (
                      <TableRow key={`${rowKey}-expanded`}>
                        <TableCell
                          colSpan={groupByItem ? 8 : 7}
                          className="p-0 border-b-0 bg-muted/20"
                        >
                          <div className="p-4 space-y-2">
                            {group.listings.map((listing, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/40 text-sm font-mono"
                              >
                                <span className="tabular-nums">
                                  {formatNumber(listing.quantity)} @{" "}
                                  {formatPrice(listing.unitPrice)} gold
                                </span>
                                <a
                                  href={listing.tileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  View tile
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            ))}
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
    );
  };

  return (
    <div className="w-full">
      <Container className="py-8">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-4">
                <Button onClick={fetchMarketplaceData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              <Card className="bg-card border-border shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-mono flex-wrap gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <User className="h-5 w-5 text-primary shrink-0" />
                      <span className="truncate">{ownerId}</span>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs hidden sm:inline-flex"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {stats.specialization}
                      </Badge>
                    </div>
                    <Button
                      onClick={fetchMarketplaceData}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="font-mono shrink-0"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                <SummaryCard
                  icon={<ShoppingCart className="h-4 w-4 text-chart-3" />}
                  title="Wants to Buy"
                  value={formatNumber(stats.activeSellListings)}
                  subValue={`${stats.uniqueItemsSold} unique items sought`}
                  accentClass="border-chart-3/25 bg-chart-3/5"
                />
                <SummaryCard
                  icon={<Package className="h-4 w-4 text-chart-4" />}
                  title="For Sale"
                  value={formatNumber(stats.activeBuyListings)}
                  subValue={`${stats.uniqueItemsBought} unique items listed`}
                  accentClass="border-chart-4/25 bg-chart-4/5"
                />
                <SummaryCard
                  icon={<MapPin className="h-4 w-4 text-primary" />}
                  title="Market Tiles"
                  value={formatNumber(stats.tilesOnMarket)}
                  subValue="Active tile locations"
                  accentClass="border-primary/25 bg-primary/5"
                />
                <SummaryCard
                  icon={<LayoutGrid className="h-4 w-4 text-blue-400" />}
                  title="Specialization"
                  value={stats.specialization}
                  subValue={`${formatNumber(stats.activeSellListings + stats.activeBuyListings)} total listings`}
                  accentClass="border-blue-500/25 bg-blue-500/5"
                />
              </div>

              <Card className="shadow-sm border-border/80">
                <CardHeader className="pb-3">
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "sell" | "buy")}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                      <TabsList className="font-mono w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto gap-1 p-1">
                        <TabsTrigger
                          value="sell"
                          className="gap-1 sm:gap-2 font-mono text-xs sm:text-sm min-w-0 px-2 sm:px-3 py-2"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate sm:hidden">Buying</span>
                          <span className="truncate hidden sm:inline">Wants to Buy</span>
                          <Badge
                            variant="secondary"
                            className="ml-auto sm:ml-1 font-mono text-[10px] sm:text-xs shrink-0 tabular-nums"
                          >
                            {ownerListings.sell.length}
                          </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                          value="buy"
                          className="gap-1 sm:gap-2 font-mono text-xs sm:text-sm min-w-0 px-2 sm:px-3 py-2"
                        >
                          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate sm:hidden">Selling</span>
                          <span className="truncate hidden sm:inline">For Sale</span>
                          <Badge
                            variant="secondary"
                            className="ml-auto sm:ml-1 font-mono text-[10px] sm:text-xs shrink-0 tabular-nums"
                          >
                            {ownerListings.buy.length}
                          </Badge>
                        </TabsTrigger>
                      </TabsList>
                      <Badge variant="outline" className="font-mono text-xs w-fit shrink-0">
                        {displayListings.length} of {totalTabListings} shown
                      </Badge>
                    </div>
                  </Tabs>
                </CardHeader>

                <CardContent className="space-y-6 pb-0">
                  <div className="space-y-3 px-6">
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
                        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",
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
                            placeholder="Search listings..."
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
                          onValueChange={handleCategoryChange}
                        >
                          <SelectTrigger className="font-mono w-full">
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="font-mono">
                              All Categories
                            </SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="font-mono">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subcategory" className="font-mono text-sm">
                          Sub Category
                        </Label>
                        <Select
                          value={selectedSubCategory}
                          onValueChange={setSelectedSubCategory}
                          disabled={selectedCategory === "all"}
                        >
                          <SelectTrigger className="font-mono w-full">
                            <SelectValue
                              placeholder={
                                selectedCategory === "all"
                                  ? "Select category first"
                                  : "All subcategories"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="font-mono">
                              All Subcategories
                            </SelectItem>
                            {subCategories.map((subCat) => (
                              <SelectItem key={subCat} value={subCat} className="font-mono">
                                {subCat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="view" className="font-mono text-sm">
                          View Mode
                        </Label>
                        <Select
                          value={groupByItem ? "grouped" : "flat"}
                          onValueChange={(value) =>
                            setGroupByItem(value === "grouped")
                          }
                        >
                          <SelectTrigger className="font-mono w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat" className="font-mono">
                              Flat View
                            </SelectItem>
                            <SelectItem value="grouped" className="font-mono">
                              Grouped by Item
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end pb-1">
                        {(searchTerm ||
                          selectedCategory !== "all" ||
                          selectedSubCategory !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="font-mono text-xs w-full"
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {listingSummary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6">
                      <SummaryCard
                        icon={<Award className="h-4 w-4 text-amber-400" />}
                        title="Lowest Price"
                        value={formatPrice(listingSummary.cheapest.minPrice)}
                        subValue={listingSummary.cheapest.itemName}
                        accentClass="border-amber-500/25 bg-amber-500/5"
                      />
                      <SummaryCard
                        icon={<Package className="h-4 w-4 text-chart-2" />}
                        title="Highest Quantity"
                        value={formatNumber(listingSummary.largestQty.totalQuantity)}
                        subValue={listingSummary.largestQty.itemName}
                        accentClass="border-chart-2/25 bg-chart-2/5"
                      />
                      <SummaryCard
                        icon={<Sparkles className="h-4 w-4 text-blue-400" />}
                        title="Average Price"
                        value={formatPrice(listingSummary.avgPrice)}
                        subValue={`Across ${displayListings.length} ${PROFILE_TABS[activeTab].title.toLowerCase()} listings`}
                        accentClass="border-blue-500/25 bg-blue-500/5"
                      />
                    </div>
                  )}

                  <div className="border-t border-border/50">
                    {renderListingsContent()}
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-accent/10 border-accent/20 mt-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground font-mono">
                      Marketplace profile tips:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                      <li>
                        • <strong>For Sale</strong> — items this player is selling (you can buy from them)
                      </li>
                      <li>
                        • <strong>Wants to Buy</strong> — items this player is looking to purchase (you can sell to them)
                      </li>
                      <li>
                        • Click column headers to sort; top 3 listings get gold, silver, and bronze accents
                      </li>
                      <li>
                        • Use <strong>Grouped by Item</strong> to combine listings across multiple tiles
                      </li>
                      <li>• Click View to open the tile on the Nomstead marketplace</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}
        </Container>
    </div>
  );
}
