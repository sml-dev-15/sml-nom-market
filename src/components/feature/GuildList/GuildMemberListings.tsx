import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  Store,
  ExternalLink,
  ShoppingCart,
  Package,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
} from "lucide-react";

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
    name?: string;
  };
  pricing: {
    unitPrice: number;
    availableQuantity?: number;
    totalPrice?: number;
  };
  type: "buy" | "sell";
}

interface GuildMarketProps {
  marketData: MarketplaceItem[];
}

const GUILD_MEMBERS = ["moonlit", "jiro"];

// Category and Subcategory definitions
const CATEGORIES = {
  items: {
    name: "Items",
    subCategories: [
      "ingredients",
      "food",
      "seeds",
      "resources",
      "gems",
      "tools",
    ],
  },
  objects: {
    name: "Objects",
    subCategories: ["tools", "farm tools", "paths", "decoration", "flags"],
  },
  recipes: {
    name: "Recipes",
    subCategories: [
      "food",
      "resources",
      "gems",
      "tools",
      "farm tools",
      "paths",
      "decoration",
      "flags",
    ],
  },
};

export function GuildMarketListings({ marketData }: GuildMarketProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set()
  );

  const guildListings = useMemo(() => {
    return marketData.filter((item) =>
      GUILD_MEMBERS.some((member) =>
        item.tile.owner.toLowerCase().includes(member.toLowerCase())
      )
    );
  }, [marketData]);

  // Get available subcategories based on selected category
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    return (
      CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.subCategories ||
      []
    );
  }, [selectedCategory]);

  const memberListings = useMemo(() => {
    const listings: {
      [key: string]: { buy: MarketplaceItem[]; sell: MarketplaceItem[] };
    } = {};

    GUILD_MEMBERS.forEach((member) => {
      const memberItems = guildListings.filter((item) =>
        item.tile.owner.toLowerCase().includes(member.toLowerCase())
      );

      const filteredItems = memberItems.filter((item) => {
        // Search filter
        const matchesSearch =
          item.object.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.object.slug.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter
        const matchesType =
          selectedType === "all" || item.type === selectedType;

        // Category filter
        const matchesCategory =
          selectedCategory === "all" ||
          item.object.category === selectedCategory;

        // Subcategory filter
        const matchesSubCategory =
          selectedSubCategory === "all" ||
          item.object.subCategory === selectedSubCategory;

        return (
          matchesSearch && matchesType && matchesCategory && matchesSubCategory
        );
      });

      listings[member] = {
        buy: filteredItems.filter((item) => item.type === "buy"),
        sell: filteredItems.filter((item) => item.type === "sell"),
      };
    });

    return listings;
  }, [
    guildListings,
    searchTerm,
    selectedType,
    selectedCategory,
    selectedSubCategory,
  ]);

  const filteredMembers = useMemo(() => {
    if (selectedMember === "all") return GUILD_MEMBERS;
    return GUILD_MEMBERS.filter((member) => member === selectedMember);
  }, [selectedMember]);

  const toggleMemberExpansion = (member: string) => {
    setExpandedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(member)) {
        newSet.delete(member);
      } else {
        newSet.add(member);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedMembers(new Set(filteredMembers));
  };

  const collapseAll = () => {
    setExpandedMembers(new Set());
  };

  const getMemberBadge = (member: string) => {
    return (
      <Badge className="bg-primary text-primary-foreground">{member}</Badge>
    );
  };

  const memberStats = useMemo(() => {
    const stats: Record<string, { buy: number; sell: number; total: number }> =
      {};

    GUILD_MEMBERS.forEach((member) => {
      const listings = memberListings[member];
      stats[member] = {
        buy: listings?.buy.length || 0,
        sell: listings?.sell.length || 0,
        total: (listings?.buy.length || 0) + (listings?.sell.length || 0),
      };
    });

    return stats;
  }, [memberListings]);

  // Reset subcategory when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("all");
  };

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="bg-muted/10 pb-4">
        <CardTitle className="font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-bold truncate">Guild Market Listings</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-sans">
                  Track trading opportunities with guild members
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="flex items-center gap-1 font-mono text-xs h-8"
                >
                  <ChevronDown className="h-3 w-3" />
                  <span className="hidden xs:inline">Expand</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="flex items-center gap-1 font-mono text-xs h-8"
                >
                  <ChevronUp className="h-3 w-3" />
                  <span className="hidden xs:inline">Collapse</span>
                </Button>
              </div>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 font-mono"
              >
                <Store className="h-3 w-3" />
                {guildListings.length}
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-muted/5 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary font-mono">
                {GUILD_MEMBERS.length}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Members
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/5 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary font-mono">
                {guildListings.length}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Total Listings
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/5 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary font-mono">
                {Object.values(memberStats).reduce(
                  (sum, stat) => sum + stat.buy,
                  0
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Buy Orders
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/5 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary font-mono">
                {Object.values(memberStats).reduce(
                  (sum, stat) => sum + stat.sell,
                  0
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Sell Orders
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-muted/5 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-mono font-semibold">Filters</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-mono">
                  Search Items
                </Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-mono pr-8 w-full"
                  />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm font-mono">
                  Guild Member
                </Label>
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                >
                  <SelectTrigger className="font-mono w-full">
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-mono">
                      All Members
                    </SelectItem>
                    {GUILD_MEMBERS.map((member) => (
                      <SelectItem
                        key={member}
                        value={member}
                        className="font-mono"
                      >
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-mono">
                  Order Type
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="font-mono w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-mono">
                      All Types
                    </SelectItem>
                    <SelectItem value="buy" className="font-mono">
                      Buy Orders
                    </SelectItem>
                    <SelectItem value="sell" className="font-mono">
                      Sell Orders
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-mono">
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
                    {Object.entries(CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key} className="font-mono">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-sm font-mono">
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
                    {availableSubCategories.map((subCat) => (
                      <SelectItem
                        key={subCat}
                        value={subCat}
                        className="font-mono capitalize"
                      >
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Cards */}
        <div className="space-y-4">
          {filteredMembers.map((member) => {
            const listings = memberListings[member];
            const totalListings =
              (listings?.buy.length || 0) + (listings?.sell.length || 0);
            const isExpanded = expandedMembers.has(member);

            if (totalListings === 0 && selectedMember !== "all") {
              return null;
            }

            return (
              <Card
                key={member}
                className="bg-card border-2 border-border shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-muted/5 transition-colors"
                  onClick={() => toggleMemberExpansion(member)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMemberBadge(member)}
                      <div>
                        <CardTitle className="text-lg font-mono">
                          {member}&apos;s Listings
                        </CardTitle>
                        <div className="flex gap-4 text-sm text-muted-foreground font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3 text-chart-3" />
                            {listings?.buy.length || 0} buy orders
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-chart-4" />
                            {listings?.sell.length || 0} sell orders
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 pt-0">
                    {/* Buy Orders */}
                    {listings?.buy && listings.buy.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-chart-3 font-mono">
                          <ShoppingCart className="h-4 w-4" />
                          Items Selling ({listings.buy.length})
                        </h4>
                        <div className="grid gap-2">
                          {listings.buy.map((item, index) => (
                            <div
                              key={`${item.tile.url}-${index}`}
                              className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm font-mono">
                                  {item.object.name || item.object.slug}
                                </div>
                                <div className="flex gap-2 text-xs text-muted-foreground font-mono">
                                  <Badge variant="outline" className="text-xs">
                                    {item.object.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {item.object.subCategory}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono mt-1">
                                  {item.pricing.availableQuantity || 1} ×{" "}
                                  {item.pricing.unitPrice.toFixed(4)} gold
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a
                                  href={item.tile.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sell Orders */}
                    {listings?.sell && listings.sell.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-chart-4 font-mono">
                          <Package className="h-4 w-4" />
                          Items Wanted ({listings.sell.length})
                        </h4>
                        <div className="grid gap-2">
                          {listings.sell.map((item, index) => (
                            <div
                              key={`${item.tile.url}-${index}`}
                              className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm font-mono">
                                  {item.object.name || item.object.slug}
                                </div>
                                <div className="flex gap-2 text-xs text-muted-foreground font-mono">
                                  <Badge variant="outline" className="text-xs">
                                    {item.object.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {item.object.subCategory}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono mt-1">
                                  {item.pricing.availableQuantity || 1} ×{" "}
                                  {item.pricing.unitPrice.toFixed(4)} gold
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a
                                  href={item.tile.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {totalListings === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-mono">
                          No active listings found
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Help Text */}
        <Alert className="bg-accent/5 border-accent/20">
          <Sparkles className="h-4 w-4 text-accent" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-foreground font-mono">
                Trading Guide:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>
                  • <strong>Items Selling</strong>: What guild members are
                  selling (you can buy from them)
                </li>
                <li>
                  • <strong>Items Wanted</strong>: What guild members want to
                  buy (you can sell to them)
                </li>
                <li>
                  • Use category and subcategory filters to narrow down specific
                  item types
                </li>
                <li>
                  • Click on member cards to expand/collapse their listings
                </li>
                <li>
                  • Use &quot;Expand All/Collapse All&quot; for quick navigation
                </li>
                <li>• Click the link icon to visit market listings directly</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
