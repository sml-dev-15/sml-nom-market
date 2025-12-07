import { useState, useMemo } from "react";
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
  Award,
} from "lucide-react";
import * as XLSX from "xlsx";

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

const ENERGY_SOURCES: EnergySource[] = [
  { slug: "wine", name: "Wine", energy: 60, category: "beverage" },
  { slug: "bread", name: "Bread", energy: 30, category: "baked" },
  {
    slug: "pumpkin_bread",
    name: "Pumpkin Bread",
    energy: 45,
    category: "baked",
  },
  {
    slug: "mushroom_soup",
    name: "Mushroom Soup",
    energy: 30,
    category: "soup",
  },
  { slug: "french_fries", name: "French Fries", energy: 6, category: "snack" },
  {
    slug: "mushroom_omelette",
    name: "Mushroom Omelette",
    energy: 45,
    category: "meal",
  },
  {
    slug: "tomato_omelette",
    name: "Tomato Omelette",
    energy: 30,
    category: "meal",
  },
  { slug: "veggie_salad", name: "Veggie Salad", energy: 6, category: "salad" },
  {
    slug: "wrapped_potato",
    name: "Wrapped Potato",
    energy: 4,
    category: "snack",
  },
];

export function EnergyVsPriceCalculator({ marketData }: EnergyVsPriceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minEnergy, setMinEnergy] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10);
  const [isCalculating, setIsCalculating] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(ENERGY_SOURCES.map((item) => item.category))];
    return ["all", ...cats];
  }, []);

  const energyComparisons = useMemo((): EnergyComparisonResult[] => {
    setIsCalculating(true);

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

    setIsCalculating(false);
    return results;
  }, [marketData]);

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

    return filtered.sort((a, b) => b.energyPerGold - a.energyPerGold);
  }, [energyComparisons, searchTerm, selectedCategory, minEnergy, maxPrice]);

  const topRecommendations = useMemo(() => {
    return filteredResults.slice(0, 3).filter((item) => item.efficiency >= 80);
  }, [filteredResults]);

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
      Recommendation: index < 3 ? "⭐ Top Pick" : "Standard",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Energy Efficiency");

    const summaryData = [
      ["Energy vs Price Analysis", "", "", ""],
      ["Generated on", new Date().toLocaleDateString(), "", ""],
      ["Total Items Analyzed", filteredResults.length, "", ""],
      [
        "Most Efficient",
        topRecommendations[0]?.name || "N/A",
        `Score: ${topRecommendations[0]?.efficiency.toFixed(1)}%` || "N/A",
        "",
      ],
      ["", "", "", ""],
      ["Rank", "Item", "Energy/Gold", "Efficiency"],
      ...topRecommendations.map((item, index) => [
        index + 1,
        item.name,
        item.energyPerGold.toFixed(2),
        `${item.efficiency.toFixed(1)}%`,
      ]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    XLSX.writeFile(
      workbook,
      `energy-efficiency-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) {
      return (
        <Badge className="bg-chart-2 text-primary-foreground flex items-center gap-1">
          <Crown className="h-3 w-3" />
          Excellent
        </Badge>
      );
    } else if (efficiency >= 75) {
      return (
        <Badge className="bg-chart-1 text-primary-foreground flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Good
        </Badge>
      );
    } else if (efficiency >= 50) {
      return (
        <Badge className="bg-chart-3 text-primary-foreground flex items-center gap-1">
          <Award className="h-3 w-3" />
          Fair
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Poor
        </Badge>
      );
    }
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 45) return "text-chart-2";
    if (energy >= 30) return "text-chart-1";
    if (energy >= 15) return "text-chart-3";
    return "text-chart-4";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
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
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                  <SelectItem key={category} value={category} className="font-mono">
                  {category === "all"
                    ? "All Categories"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
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
              max="60"
              step="5"
              value={minEnergy}
              onChange={(e) => setMinEnergy(Number(e.target.value))}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="font-mono text-sm">
              Max Price ({maxPrice.toFixed(2)})
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

        {/* Top Recommendations */}
        {topRecommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommendations.map((item, index) => (
              <Card
                key={item.slug}
                className="bg-accent/10 border-accent/20 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Crown className="h-5 w-5 text-chart-2" />
                      )}
                      {index === 1 && (
                        <Award className="h-5 w-5 text-chart-1" />
                      )}
                      {index === 2 && (
                        <Award className="h-5 w-5 text-chart-3" />
                      )}
                      <h3 className="font-bold text-lg font-mono">
                        {item.name}
                      </h3>
                    </div>
                    <Badge className="bg-chart-2 text-primary-foreground font-mono">
                      #{index + 1}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Energy:</span>
                      <span
                        className={`font-semibold ${getEnergyColor(
                          item.energy
                        )}`}
                      >
                        {item.energy} ⚡
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold">
                        {item.lowestPrice.toFixed(4)} gold
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Energy/Gold:
                      </span>
                      <span className="font-bold text-chart-2">
                        {item.energyPerGold.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="font-semibold">
                        {item.efficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {item.seller && item.url && (
                    <div className="mt-2 text-xs text-muted-foreground font-mono">
                      Best deal by:{" "}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {item.seller}
                      </a>
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
                Energy Efficiency Rankings
                <Badge variant="secondary" className="ml-2 font-mono">
                  {filteredResults.length} items
                </Badge>
              </CardTitle>
              {isCalculating && (
                <Badge variant="outline" className="animate-pulse font-mono">
                  Calculating...
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono">
                  No energy items found matching your criteria.
                </p>
                <p className="text-sm font-mono">
                  Try adjusting your filters or check market availability.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Rank</TableHead>
                    <TableHead className="font-mono">Item</TableHead>
                    <TableHead className="text-center font-mono">
                      Energy
                    </TableHead>
                    <TableHead className="text-right font-mono">
                      Price
                    </TableHead>
                    <TableHead className="text-right font-mono">
                      Energy/Gold
                    </TableHead>
                    <TableHead className="text-center font-mono">
                      Efficiency
                    </TableHead>
                    <TableHead className="text-center font-mono">
                      Seller
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((item, index) => (
                    <TableRow
                      key={item.slug}
                      className={index < 3 ? "bg-accent/5" : ""}
                    >
                      <TableCell className="font-medium font-mono">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Crown className="h-4 w-4 text-chart-2" />
                          )}
                          {index === 1 && (
                            <Award className="h-4 w-4 text-chart-1" />
                          )}
                          {index === 2 && (
                            <Award className="h-4 w-4 text-chart-3" />
                          )}
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold font-mono">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-bold ${getEnergyColor(
                            item.energy
                          )} font-mono`}
                        >
                          {item.energy} ⚡
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.lowestPrice.toFixed(4)}
                        <div className="text-xs text-muted-foreground font-mono">
                          gold
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="font-bold text-chart-2">
                          {item.energyPerGold.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getEfficiencyBadge(item.efficiency)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {item.seller && item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {item.seller}
                            {item.alternativeCount &&
                              item.alternativeCount > 0 && (
                                <span className="text-xs text-accent ml-1">
                                  (+{item.alternativeCount})
                                </span>
                              )}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No seller
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
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
                How to use this calculator:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>
                  • <strong>Energy per Gold</strong> shows how much energy you
                  get for 1 gold spent
                </li>
                <li>
                  • <strong>Higher values</strong> mean better cost efficiency
                </li>
                <li>
                  • <strong>Top picks</strong> are items with efficiency scores
                  above 80%
                </li>
                <li>• Click on seller names to visit their market listings</li>
                <li>
                  • Use filters to find items matching your energy needs and
                  budget
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
