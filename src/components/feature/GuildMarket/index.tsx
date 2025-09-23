import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  ShoppingCart,
  Package,
  Filter,
  SortAsc,
  Crown,
  Zap,
  TrendingUp,
  Info,
  RefreshCw,
  Users,
} from "lucide-react";
import { useFetchMarketData } from "@/hooks/data-fetch";
import Image from "next/image";
import { Container } from "@/components/ui/container";

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
      title: string;
      description: string;
    };
    imageUrl: string;
    thumbnailImageUrl: string;
  };
  pricing: {
    unitPrice: number;
    availableQuantity?: number;
    desiredQuantity?: number;
  };
}

const guildKingdomName = ["moonlit"];

const ITEMS_PER_PAGE = 8;
type SortOption =
  | "price-low"
  | "price-high"
  | "quantity-low"
  | "quantity-high"
  | "name"
  | "recent";

interface GuildItemCardProps {
  item: MarketplaceItem;
  type: "buy" | "sell";
}

function GuildItemCard({ item, type }: GuildItemCardProps) {
  const totalValue =
    item.pricing.unitPrice *
    (item.pricing.availableQuantity || item.pricing.desiredQuantity || 1);
  const [imageError, setImageError] = useState(false);

  const isPremiumItem = item.pricing.unitPrice > 1000;
  const isHighQuantity =
    (item.pricing.availableQuantity || item.pricing.desiredQuantity || 0) > 50;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 truncate">
              <span className="truncate">{item.object.metadata.title}</span>
              {isPremiumItem && (
                <Tooltip>
                  <TooltipTrigger>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>Premium Item</TooltipContent>
                </Tooltip>
              )}
              {isHighQuantity && (
                <Tooltip>
                  <TooltipTrigger>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>High Availability</TooltipContent>
                </Tooltip>
              )}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {item.object.metadata.description}
            </CardDescription>
          </div>
          {!imageError && item.object.thumbnailImageUrl ? (
            <Image
              src={item.object.thumbnailImageUrl}
              alt={item.object.metadata.title}
              width={64} // equivalent to w-16
              height={64} // equivalent to h-16
              className="object-cover rounded-lg ml-3 border-2 group-hover:border-primary transition-colors"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded-lg ml-3 flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {item.tile.owner}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.object.category}
            </Badge>
            {item.object.subCategory && (
              <Badge variant="outline" className="text-xs">
                {item.object.subCategory}
              </Badge>
            )}
          </div>

          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-3 rounded-lg space-y-2 border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1">
                Unit Price
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Price per unit</TooltipContent>
                </Tooltip>
              </span>
              <span className="font-bold text-primary">
                ${item.pricing.unitPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {type === "buy" ? "Available" : "Desired"}
              </span>
              <span className="font-semibold text-lg">
                {item.pricing.availableQuantity ||
                  item.pricing.desiredQuantity ||
                  0}
              </span>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Value</span>
                <span className="font-bold text-lg text-primary bg-primary/10 px-2 py-1 rounded">
                  ${totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-3 group-hover:scale-105 transition-transform"
            onClick={() => window.open(item.tile.url, "_blank")}
            variant={isPremiumItem ? "default" : "outline"}
          >
            <Zap className="h-4 w-4 mr-2" />
            {type === "buy" ? "Purchase Item" : "Sell Item"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface MarketSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: MarketplaceItem[];
  type: "buy" | "sell";
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function MarketSection({
  title,
  subtitle,
  icon,
  items,
  type,
  isLoading,
  error,
  onRetry,
}: MarketSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("price-low");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.object.category))];
  }, [items]);

  const subCategories = useMemo(() => {
    if (categoryFilter === "all") return [];
    return [
      ...new Set(
        items
          .filter((item) => item.object.category === categoryFilter)
          .map((item) => item.object.subCategory)
      ),
    ];
  }, [items, categoryFilter]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.object.metadata.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.object.category
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.object.subCategory
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.tile.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.object.category === categoryFilter
      );
    }

    // Subcategory filter
    if (subCategoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.object.subCategory === subCategoryFilter
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.pricing.unitPrice - b.pricing.unitPrice;
        case "price-high":
          return b.pricing.unitPrice - a.pricing.unitPrice;
        case "quantity-low":
          return (
            (a.pricing.availableQuantity || a.pricing.desiredQuantity || 0) -
            (b.pricing.availableQuantity || b.pricing.desiredQuantity || 0)
          );
        case "quantity-high":
          return (
            (b.pricing.availableQuantity || b.pricing.desiredQuantity || 0) -
            (a.pricing.availableQuantity || a.pricing.desiredQuantity || 0)
          );
        case "name":
          return a.object.metadata.title.localeCompare(b.object.metadata.title);
        case "recent":
          return 0; // Add timestamp field for proper recent sorting
        default:
          return 0;
      }
    });
  }, [items, searchTerm, categoryFilter, subCategoryFilter, sortBy]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedItems, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const totalValue = useMemo(() => {
    return filteredAndSortedItems.reduce((sum, item) => {
      const quantity =
        item.pricing.availableQuantity || item.pricing.desiredQuantity || 0;
      return sum + item.pricing.unitPrice * quantity;
    }, 0);
  }, [filteredAndSortedItems]);

  if (error) {
    return (
      <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {subtitle} • {filteredAndSortedItems.length} items • $
              {totalValue.toLocaleString()} total value
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{filteredAndSortedItems.length} results</span>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search items, categories, or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setSubCategoryFilter("all");
          }}
        >
          <SelectTrigger className="bg-background w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={subCategoryFilter}
          onValueChange={setSubCategoryFilter}
          disabled={categoryFilter === "all" || subCategories.length === 0}
        >
          <SelectTrigger className="bg-background w-full">
            <SelectValue placeholder="All Subcategories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subcategories</SelectItem>
            {subCategories.map((subCategory) => (
              <SelectItem key={subCategory} value={subCategory}>
                {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="bg-background w-full">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="quantity-low">Quantity: Low to High</SelectItem>
            <SelectItem value="quantity-high">Quantity: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedItems.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {paginatedItems.map((item, index) => (
              <GuildItemCard
                key={`${item.object.slug}-${item.tile.owner}-${index}`}
                item={item}
                type={type}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} •{" "}
                {filteredAndSortedItems.length} items
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum =
                      currentPage <= 3
                        ? i + 1
                        : Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            {type === "buy" ? (
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            )}
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your search filters"
                : type === "buy"
                ? "No items available for purchase from guild members"
                : "No items requested by guild members"}
            </p>
            {(searchTerm || categoryFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setSubCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function GuildMarketplace() {
  const [activeTab, setActiveTab] = useState("all");

  // Use your existing hook for both buy and sell data
  const {
    data: buyData,
    loading: buyLoading,
    error: buyError,
    refetch: refetchBuy,
  } = useFetchMarketData("toBuy");
  const {
    data: sellData,
    loading: sellLoading,
    error: sellError,
    refetch: refetchSell,
  } = useFetchMarketData("toSell");

  // Convert the data from useFetchMarketData to MarketplaceItem format
  const guildItems = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterGuildItems = (items: any[]) =>
      items.filter((item) => guildKingdomName.includes(item.owner));

    return {
      toBuy: filterGuildItems(buyData).map((item) => ({
        tile: {
          url: item.visit,
          owner: item.owner,
        },
        object: {
          slug: item.slug,
          category: item.category,
          subCategory: item.subCategory,
          metadata: {
            title: item.name,
            description: "", // You might want to add description to your DataProps
          },
          imageUrl: item.image,
          thumbnailImageUrl: item.image,
        },
        pricing: {
          unitPrice: item.unitPrice,
          availableQuantity: item.availableQuantity,
        },
      })),
      toSell: filterGuildItems(sellData).map((item) => ({
        tile: {
          url: item.visit,
          owner: item.owner,
        },
        object: {
          slug: item.slug,
          category: item.category,
          subCategory: item.subCategory,
          metadata: {
            title: item.name,
            description: "", // You might want to add description to your DataProps
          },
          imageUrl: item.image,
          thumbnailImageUrl: item.image,
        },
        pricing: {
          unitPrice: item.unitPrice,
          desiredQuantity: item.availableQuantity,
        },
      })),
    };
  }, [buyData, sellData]);

  return (
    <div className="w-full min-h-screen rounded-2xl py-8">
      <Container className="relative ">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-lg">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold">Guild Marketplace</h3>
          </div>
          <p className="text-muted-foreground">
            Secure trading with trusted guild members
          </p>
        </div>

        <div className="mb-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full "
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[400px] mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Items
              </TabsTrigger>
              <TabsTrigger value="buy" className="flex items-center gap-2">
                Market
              </TabsTrigger>
              <TabsTrigger value="sell" className="flex items-center gap-2">
                Requests
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {guildItems.toBuy?.length || 0} items
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {guildItems.toSell?.length || 0} items
            </Badge>
            <Button
              onClick={refetchBuy || refetchSell}
              variant="outline"
              size="sm"
              disabled={buyLoading || sellLoading}
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  buyLoading || sellLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>
        <TooltipProvider>
          <div className="space-y-8">
            {(activeTab === "all" || activeTab === "buy") && (
              <MarketSection
                title="Guild Market"
                subtitle="Items available for purchase"
                icon={<ShoppingCart className="h-6 w-6 text-primary" />}
                items={guildItems.toBuy}
                type="buy"
                isLoading={buyLoading}
                error={buyError}
                onRetry={refetchBuy}
              />
            )}

            {(activeTab === "all" || activeTab === "sell") && (
              <MarketSection
                title="Guild Request Board"
                subtitle="Items guild members want to buy"
                icon={<Package className="h-6 w-6 text-primary" />}
                items={guildItems.toSell}
                type="sell"
                isLoading={sellLoading}
                error={sellError}
                onRetry={refetchSell}
              />
            )}
          </div>
        </TooltipProvider>
      </Container>
    </div>
  );
}
