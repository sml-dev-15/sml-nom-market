"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Store,
  ShoppingCart,
  Package,
  TrendingUp,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

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

export function OwnerProfileView({ ownerId }: OwnerProfileViewProps) {
  const [marketplaceData, setMarketplaceData] = useState<{
    toBuy: MarketplaceItem[];
    toSell: MarketplaceItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "quantity" | "name">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [groupByItem, setGroupByItem] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

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

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let listings = activeTab === "sell" ? ownerListings.sell : ownerListings.buy;

    // Apply filters
    listings = listings.filter((listing) => {
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

    // Sort
    listings.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = a.unitPrice - b.unitPrice;
      } else if (sortBy === "quantity") {
        comparison = a.quantity - b.quantity;
      } else {
        comparison = a.itemName.localeCompare(b.itemName);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return listings;
  }, [
    ownerListings,
    activeTab,
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    sortOrder,
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
        subCategory: listings[0].category,
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

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("all");
  };

  const currentListings = groupByItem
    ? groupedListings || []
    : filteredListings.map((listing) => ({
        ...listing,
        listings: [listing],
        tileCount: 1,
        totalQuantity: listing.quantity,
        minPrice: listing.unitPrice,
        maxPrice: listing.unitPrice,
        avgPrice: listing.unitPrice,
      }));

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
              {/* Profile Header */}
              <Card className="mb-8 border-primary/20 shadow-xl bg-gradient-to-br from-card via-card to-card/80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative p-4 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl shadow-lg ring-2 ring-primary/10">
                        <User className="h-8 w-8 text-primary" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl sm:text-3xl mb-3 font-bold tracking-tight">
                          {ownerId}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs sm:text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
                        >
                          <Sparkles className="h-3 w-3 mr-1.5" />
                          {stats.specialization}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={fetchMarketplaceData}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="shrink-0 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <Card className="bg-gradient-to-br from-chart-4/15 via-chart-4/10 to-chart-4/5 border-chart-4/30 shadow-md hover:shadow-lg hover:border-chart-4/40 transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-chart-4/20 rounded-lg group-hover:bg-chart-4/30 transition-colors">
                              <Package className="h-5 w-5 text-chart-4" />
                            </div>
                            <p className="text-sm text-muted-foreground font-semibold">
                              Sell Listings
                            </p>
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-chart-4 mb-1">
                          {stats.activeSellListings}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.uniqueItemsSold} unique {stats.uniqueItemsSold === 1 ? "item" : "items"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-chart-3/15 via-chart-3/10 to-chart-3/5 border-chart-3/30 shadow-md hover:shadow-lg hover:border-chart-3/40 transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-chart-3/20 rounded-lg group-hover:bg-chart-3/30 transition-colors">
                              <ShoppingCart className="h-5 w-5 text-chart-3" />
                            </div>
                            <p className="text-sm text-muted-foreground font-semibold">
                              Buy Listings
                            </p>
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-chart-3 mb-1">
                          {stats.activeBuyListings}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.uniqueItemsBought} unique {stats.uniqueItemsBought === 1 ? "item" : "items"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Listings Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sell" | "buy")}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <TabsList className="w-full sm:w-auto bg-muted/50 p-1.5">
                    <TabsTrigger
                      value="sell"
                      className="flex items-center gap-2 flex-1 sm:flex-none data-[state=active]:bg-chart-4/10 data-[state=active]:text-chart-4 data-[state=active]:shadow-sm transition-all"
                    >
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">Sell</span>
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-xs bg-chart-4/20 text-chart-4 border-chart-4/30"
                      >
                        {ownerListings.sell.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="buy"
                      className="flex items-center gap-2 flex-1 sm:flex-none data-[state=active]:bg-chart-3/10 data-[state=active]:text-chart-3 data-[state=active]:shadow-sm transition-all"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">Buy</span>
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-xs bg-chart-3/20 text-chart-3 border-chart-3/30"
                      >
                        {ownerListings.buy.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                  {filteredListings.length > 0 && (
                    <div className="text-sm text-muted-foreground font-medium px-2 py-1 bg-muted/30 rounded-md">
                      <span className="text-foreground font-semibold">
                        {filteredListings.length}
                      </span>{" "}
                      of{" "}
                      <span className="text-foreground font-semibold">
                        {activeTab === "sell"
                          ? ownerListings.sell.length
                          : ownerListings.buy.length}
                      </span>{" "}
                      listings
                    </div>
                  )}
                </div>

                {/* Filters */}
                <Card className="mb-6 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Filter className="h-4 w-4 text-primary" />
                        </div>
                        Filters & Options
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {(searchTerm ||
                          selectedCategory !== "all" ||
                          selectedSubCategory !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("all");
                              setSelectedSubCategory("all");
                            }}
                            className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Clear All
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiltersExpanded(!filtersExpanded)}
                          className="h-8 w-8 p-0"
                        >
                          {filtersExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {filtersExpanded && (
                    <CardContent>
                      {/* Active Filters */}
                      {(searchTerm ||
                        selectedCategory !== "all" ||
                        selectedSubCategory !== "all") && (
                        <div className="mb-4 pb-4 border-b border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                            Active Filters
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {searchTerm && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2.5 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
                              >
                                <Search className="h-3 w-3 mr-1.5" />
                                &quot;{searchTerm}&quot;
                                <button
                                  onClick={() => setSearchTerm("")}
                                  className="ml-1.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            )}
                            {selectedCategory !== "all" && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2.5 py-1 bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/15 transition-colors"
                              >
                                Category: {selectedCategory}
                                <button
                                  onClick={() => {
                                    setSelectedCategory("all");
                                    setSelectedSubCategory("all");
                                  }}
                                  className="ml-1.5 hover:bg-chart-2/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            )}
                            {selectedSubCategory !== "all" && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15 transition-colors"
                              >
                                Sub: {selectedSubCategory}
                                <button
                                  onClick={() => setSelectedSubCategory("all")}
                                  className="ml-1.5 hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm">
                          Search
                        </Label>
                        <div className="relative">
                          <Input
                            id="search"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-8"
                          />
                          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm">
                          Category
                        </Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={handleCategoryChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subcategory" className="text-sm">
                          Sub Category
                        </Label>
                        <Select
                          value={selectedSubCategory}
                          onValueChange={setSelectedSubCategory}
                          disabled={selectedCategory === "all"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                selectedCategory === "all"
                                  ? "Select category first"
                                  : "All subcategories"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subcategories</SelectItem>
                            {subCategories.map((subCat) => (
                              <SelectItem key={subCat} value={subCat}>
                                {subCat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sort" className="text-sm">
                          Sort By
                        </Label>
                        <Select
                          value={`${sortBy}-${sortOrder}`}
                          onValueChange={(value) => {
                            const [by, order] = value.split("-");
                            setSortBy(by as "price" | "quantity" | "name");
                            setSortOrder(order as "asc" | "desc");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="quantity-asc">Quantity: Low to High</SelectItem>
                            <SelectItem value="quantity-desc">Quantity: High to Low</SelectItem>
                            <SelectItem value="name-asc">Name: A to Z</SelectItem>
                            <SelectItem value="name-desc">Name: Z to A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="group" className="text-sm">
                          View
                        </Label>
                        <Select
                          value={groupByItem ? "grouped" : "flat"}
                          onValueChange={(value) => setGroupByItem(value === "grouped")}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat">Flat View</SelectItem>
                            <SelectItem value="grouped">Grouped by Item</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    </CardContent>
                  )}
                </Card>

                {/* Sell Listings */}
                <TabsContent value="sell" className="mt-0">
                  {filteredListings.length === 0 ? (
                    <Card className="border-dashed border-2 border-border/50 bg-muted/20">
                      <CardContent className="py-20 text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-chart-4/10 to-chart-4/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <Package className="h-10 w-10 text-chart-4 opacity-60" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">No sell listings found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm leading-relaxed">
                          {searchTerm || selectedCategory !== "all"
                            ? "No listings match your current filters. Try adjusting your search or filter criteria to see more results."
                            : "This owner currently has no active sell listings available."}
                        </p>
                        {(searchTerm || selectedCategory !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("all");
                              setSelectedSubCategory("all");
                            }}
                            className="hover:bg-primary/10 hover:border-primary/30"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear All Filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {currentListings.map((group, index) => (
                        <Card key={`${group.slug || group.itemName}-${index}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              {group.thumbnailImageUrl && (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                                  <Image
                                    src={group.thumbnailImageUrl}
                                    alt={group.itemName}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg mb-1">
                                      {group.itemName}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="secondary" className="text-xs">
                                        {group.category}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {group.subCategory}
                                      </Badge>
                                      {groupByItem && group.tileCount > 1 && (
                                        <Badge variant="outline" className="text-xs">
                                          {group.tileCount} tiles
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {groupByItem ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/50">
                                      <div className="text-center sm:text-left">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                          Total Quantity
                                        </p>
                                        <p className="text-2xl font-bold font-mono text-foreground">
                                          {group.totalQuantity}
                                        </p>
                                      </div>
                                      <div className="text-center sm:text-left">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                          Price Range
                                        </p>
                                        <p className="text-sm font-bold font-mono text-foreground">
                                          {group.minPrice === group.maxPrice
                                            ? `${group.minPrice.toFixed(4)} gold`
                                            : `${group.minPrice.toFixed(4)} - ${group.maxPrice.toFixed(4)} gold`}
                                        </p>
                                      </div>
                                      <div className="text-center sm:text-left">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                          Avg Price
                                        </p>
                                        <p className="text-sm font-bold font-mono text-primary">
                                          {group.avgPrice.toFixed(4)} gold
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-3 pt-3 border-t border-border/50">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Per Tile Details
                                      </p>
                                      <div className="space-y-2">
                                        {group.listings.map((listing, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg text-sm transition-all duration-200 border border-transparent hover:border-border/50 group/item"
                                          >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                              <div className="p-1.5 bg-primary/10 rounded-md group-hover/item:bg-primary/20 transition-colors">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                              </div>
                                              <span className="font-mono text-xs sm:text-sm truncate">
                                                <span className="font-semibold">
                                                  {listing.quantity}
                                                </span>{" "}
                                                @{" "}
                                                <span className="text-primary font-semibold">
                                                  {listing.unitPrice.toFixed(4)}
                                                </span>{" "}
                                                gold
                                              </span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              asChild
                                              className="h-8 shrink-0 hover:bg-primary/10 hover:text-primary"
                                            >
                                              <a
                                                href={listing.tileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-medium"
                                              >
                                                View
                                                <ExternalLink className="h-3.5 w-3.5" />
                                              </a>
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                        Price
                                      </p>
                                      <p className="text-2xl font-bold font-mono text-primary">
                                        {group.minPrice.toFixed(4)}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">gold</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl border border-border/50">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                        Quantity
                                      </p>
                                      <p className="text-2xl font-bold font-mono text-foreground">
                                        {group.totalQuantity}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">units</p>
                                    </div>
                                    <div className="flex items-end sm:justify-end">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        asChild
                                        className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
                                      >
                                        <a
                                          href={group.listings[0].tileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-center gap-2 font-medium"
                                        >
                                          <MapPin className="h-4 w-4" />
                                          View Tile
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Buy Listings */}
                <TabsContent value="buy" className="mt-0">
                  {filteredListings.length === 0 ? (
                    <Card className="border-dashed border-2 border-border/50 bg-muted/20">
                      <CardContent className="py-20 text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-chart-3/10 to-chart-3/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <ShoppingCart className="h-10 w-10 text-chart-3 opacity-60" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">No buy listings found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm leading-relaxed">
                          {searchTerm || selectedCategory !== "all"
                            ? "No listings match your current filters. Try adjusting your search or filter criteria to see more results."
                            : "This owner currently has no active buy listings available."}
                        </p>
                        {(searchTerm || selectedCategory !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("all");
                              setSelectedSubCategory("all");
                            }}
                            className="hover:bg-chart-3/10 hover:border-chart-3/30"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear All Filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {currentListings.map((group, index) => (
                        <Card
                          key={`${group.slug || group.itemName}-${index}`}
                          className="border-border/60 hover:border-chart-3/50 transition-all duration-300 hover:shadow-lg group overflow-hidden bg-gradient-to-br from-card to-card/50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/0 via-chart-3/0 to-chart-3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          <CardContent className="p-5 sm:p-6 relative">
                            <div className="flex items-start gap-4">
                              {group.thumbnailImageUrl && (
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-border/60 group-hover:border-chart-3/40 shrink-0 bg-muted shadow-sm group-hover:shadow-md transition-all duration-300">
                                  <Image
                                    src={group.thumbnailImageUrl}
                                    alt={group.itemName}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3 gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg sm:text-xl mb-2.5 truncate group-hover:text-chart-3 transition-colors">
                                      {group.itemName}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs font-medium bg-chart-3/10 text-chart-3 border-chart-3/20"
                                      >
                                        {group.category}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-border/60"
                                      >
                                        {group.subCategory}
                                      </Badge>
                                      {groupByItem && group.tileCount > 1 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-chart-3/5 border-chart-3/20 text-chart-3"
                                        >
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {group.tileCount} tiles
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {groupByItem ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/50">
                                      <div className="text-center sm:text-left">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                          Total Desired
                                        </p>
                                        <p className="text-2xl font-bold font-mono text-foreground">
                                          {group.totalQuantity}
                                        </p>
                                      </div>
                                      <div className="text-center sm:text-left">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                          Price Range
                                        </p>
                                        <p className="text-sm font-bold font-mono text-foreground">
                                          {group.minPrice === group.maxPrice
                                            ? `${group.minPrice.toFixed(4)} gold`
                                            : `${group.minPrice.toFixed(4)} - ${group.maxPrice.toFixed(4)} gold`}
                                        </p>
                                      </div>
                                      <div className="text-center sm:text-left">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                          Avg Price
                                        </p>
                                        <p className="text-sm font-bold font-mono text-chart-3">
                                          {group.avgPrice.toFixed(4)} gold
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-3 pt-3 border-t border-border/50">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Per Tile Details
                                      </p>
                                      <div className="space-y-2">
                                        {group.listings.map((listing, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg text-sm transition-all duration-200 border border-transparent hover:border-border/50 group/item"
                                          >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                              <div className="p-1.5 bg-chart-3/10 rounded-md group-hover/item:bg-chart-3/20 transition-colors">
                                                <MapPin className="h-3.5 w-3.5 text-chart-3" />
                                              </div>
                                              <span className="font-mono text-xs sm:text-sm truncate">
                                                <span className="font-semibold">
                                                  {listing.quantity}
                                                </span>{" "}
                                                @{" "}
                                                <span className="text-chart-3 font-semibold">
                                                  {listing.unitPrice.toFixed(4)}
                                                </span>{" "}
                                                gold
                                              </span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              asChild
                                              className="h-8 shrink-0 hover:bg-chart-3/10 hover:text-chart-3"
                                            >
                                              <a
                                                href={listing.tileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-medium"
                                              >
                                                View
                                                <ExternalLink className="h-3.5 w-3.5" />
                                              </a>
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/5 rounded-xl border border-chart-3/20">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                        Offered Price
                                      </p>
                                      <p className="text-2xl font-bold font-mono text-chart-3">
                                        {group.minPrice.toFixed(4)}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">gold</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl border border-border/50">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                        Desired Qty
                                      </p>
                                      <p className="text-2xl font-bold font-mono text-foreground">
                                        {group.totalQuantity}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">units</p>
                                    </div>
                                    <div className="flex items-end sm:justify-end">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        asChild
                                        className="w-full sm:w-auto bg-chart-3 hover:bg-chart-3/90 shadow-md hover:shadow-lg transition-all"
                                      >
                                        <a
                                          href={group.listings[0].tileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-center gap-2 font-medium"
                                        >
                                          <MapPin className="h-4 w-4" />
                                          View Tile
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </Container>
    </div>
  );
}
