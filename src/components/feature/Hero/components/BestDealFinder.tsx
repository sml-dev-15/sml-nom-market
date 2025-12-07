"use client";

import { useMemo, useState } from "react";
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
import {
  TrendingDown,
  ExternalLink,
  Award,
  Search,
  Filter,
} from "lucide-react";
import Image from "next/image";

interface DataProps {
  action?: string;
  slug: string;
  name: string;
  category: string;
  subCategory: string;
  unitPrice: number;
  availableQuantity?: number;
  desiredQuantity?: number;
  owner: string;
  image: string;
  visit: string;
}

interface BestDealFinderProps {
  data: DataProps[];
}

export function BestDealFinder({ data }: BestDealFinderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const cats = [...new Set(data.map((item) => item.category))].filter(
      Boolean
    );
    return cats.sort();
  }, [data]);

  const subCategories = useMemo(() => {
    if (selectedCategory === "all") {
      const subCats = [...new Set(data.map((item) => item.subCategory))].filter(
        Boolean
      );
      return subCats.sort();
    }
    const subCats = [
      ...new Set(
        data
          .filter((item) => item.category === selectedCategory)
          .map((item) => item.subCategory)
      ),
    ].filter(Boolean);
    return subCats.sort();
  }, [data, selectedCategory]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSubCategory =
        selectedSubCategory === "all" ||
        item.subCategory === selectedSubCategory;
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesSearch;
    });
  }, [data, selectedCategory, selectedSubCategory, searchTerm]);

  const bestDeals = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // If searching for a specific item, find all listings and show lowest price
    if (searchTerm !== "") {
      const itemMap = new Map<string, DataProps[]>();
      filteredData.forEach((item) => {
        const key = item.slug.toLowerCase();
        if (!itemMap.has(key)) {
          itemMap.set(key, []);
        }
        itemMap.get(key)!.push(item);
      });

      const results: Array<{
        itemName: string;
        item: DataProps;
        alternativeCount: number;
        group: string;
      }> = [];

      itemMap.forEach((items, key) => {
        const lowestPriceItem = items.reduce((min, item) =>
          item.unitPrice < min.unitPrice ? item : min
        );
        results.push({
          itemName: lowestPriceItem.name,
          item: lowestPriceItem,
          alternativeCount: items.length - 1,
          group: key,
        });
      });

      return results.sort((a, b) => a.item.unitPrice - b.item.unitPrice);
    }

    // Group by category/subcategory and find lowest price
    const groupMap = new Map<string, DataProps[]>();
    filteredData.forEach((item) => {
      const groupKey =
        selectedCategory === "all"
          ? item.category
          : selectedSubCategory === "all"
          ? `${item.category}-${item.subCategory}`
          : item.slug;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(item);
    });

    const lowestPriceItems: Array<{
      group: string;
      item: DataProps;
    }> = [];

    groupMap.forEach((items, group) => {
      const lowestPriceItem = items.reduce((min, item) =>
        item.unitPrice < min.unitPrice ? item : min
      );
      lowestPriceItems.push({
        group,
        item: lowestPriceItem,
      });
    });

    // Sort by price (lowest first) and take top 12
    lowestPriceItems.sort((a, b) => a.item.unitPrice - b.item.unitPrice);
    return lowestPriceItems.slice(0, 12);
  }, [filteredData, selectedCategory, selectedSubCategory, searchTerm]);

  // Reset subcategory when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("all");
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="font-mono text-sm">
                Search Item
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by name or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-mono pr-8"
                />
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="font-mono">
                      {category}
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
                disabled={selectedCategory === "all" && searchTerm === ""}
              >
                <SelectTrigger className="font-mono w-full">
                  <SelectValue
                    placeholder={
                      selectedCategory === "all" && searchTerm === ""
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

      {/* Best Deals Results */}
      {bestDeals.length > 0 ? (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Best Deals</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {searchTerm
                    ? `Lowest prices for "${searchTerm}"`
                    : selectedCategory !== "all"
                    ? `Lowest prices in ${selectedCategory}`
                    : "Lowest prices across all categories"}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestDeals.map((deal, index) => (
                <Card
                  key={`${deal.group || deal.item.name}-${deal.item.slug}-${index}`}
                  className="border-border hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {index === 0 && (
                          <Award className="h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                        {deal.item.category && (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {deal.item.category}
                          </Badge>
                        )}
                        {deal.item.subCategory && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {deal.item.subCategory}
                          </Badge>
                        )}
                        {"alternativeCount" in deal &&
                          (deal as { alternativeCount: number }).alternativeCount > 0 && (
                            <Badge variant="outline" className="font-mono text-xs">
                              +{(deal as { alternativeCount: number }).alternativeCount} more
                            </Badge>
                          )}
                      </div>
                      <Badge className="bg-primary text-primary-foreground font-mono shrink-0">
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      {deal.item.image && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                          <Image
                            src={deal.item.image}
                            alt={deal.item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {deal.item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {deal.item.owner}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-bold font-mono text-primary">
                          {deal.item.unitPrice.toFixed(4)} gold
                        </p>
                      </div>
                      {deal.item.availableQuantity && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Qty</p>
                          <p className="text-sm font-semibold font-mono">
                            {deal.item.availableQuantity}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={deal.item.visit}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Listing
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto bg-muted rounded-full p-4 w-fit mb-4">
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No deals found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
