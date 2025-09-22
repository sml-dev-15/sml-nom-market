import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  X,
  Download,
  Upload,
  Plus,
  Search,
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
    desiredQuantity?: number;
  };
}

interface TaskComparisonProps {
  marketData: MarketplaceItem[];
}

interface ComparisonResult {
  id: string;
  itemName: string;
  quantity: number;
  taskReward: number;
  marketPrice: number;
  totalMarketCost: number;
  profitLoss: number;
  recommendation: "buy" | "task" | "neutral";
  availableQuantity?: number;
  seller?: string;
  url?: string;
  alternativeCount?: number;
  timestamp: number;
}

export function TaskComparison({ marketData }: TaskComparisonProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [taskReward, setTaskReward] = useState<number>(0);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalStats = useMemo(() => {
    if (results.length === 0) return null;

    const totalProfit = results.reduce(
      (sum, result) => sum + result.profitLoss,
      0
    );
    const totalReward = results.reduce(
      (sum, result) => sum + result.taskReward,
      0
    );
    const totalMarketCost = results.reduce(
      (sum, result) => sum + result.totalMarketCost,
      0
    );
    const buyRecommendations = results.filter(
      (r) => r.recommendation === "buy"
    ).length;
    const taskRecommendations = results.filter(
      (r) => r.recommendation === "task"
    ).length;

    return {
      totalProfit,
      totalReward,
      totalMarketCost,
      buyRecommendations,
      taskRecommendations,
      totalTasks: results.length,
    };
  }, [results]);

  const availableItems = useMemo(() => {
    return marketData.map((item) => ({
      name: item.object.slug,
      displayName:
        typeof item.object.metadata === "object" &&
        item.object.metadata &&
        "title" in item.object.metadata
          ? (item.object.metadata.title as string)
          : item.object.slug,
      price: item.pricing.unitPrice,
      availableQuantity: item.pricing.availableQuantity || 0,
      owner: item.tile.owner,
      url: item.tile.url,
    }));
  }, [marketData]);

  const findLowestPriceItem = (searchTerm: string) => {
    const matchingItems = availableItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingItems.length === 0) return null;

    // Sort by price (lowest first), then by available quantity (highest first)
    const sortedItems = matchingItems.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      return b.availableQuantity - a.availableQuantity;
    });

    return {
      ...sortedItems[0],
      totalAvailable: matchingItems.reduce(
        (sum, item) => sum + item.availableQuantity,
        0
      ),
      alternativeCount: matchingItems.length - 1,
    };
  };

  const calculateComparison = () => {
    if (!itemName || quantity <= 0 || taskReward <= 0) {
      return;
    }

    const lowestPriceItem = findLowestPriceItem(itemName);

    if (!lowestPriceItem) {
      return;
    }

    const totalMarketCost = lowestPriceItem.price * quantity;
    const profitLoss = taskReward - totalMarketCost;

    let recommendation: "buy" | "task" | "neutral";
    if (profitLoss > 0) {
      recommendation = "buy";
    } else if (profitLoss < 0) {
      recommendation = "task";
    } else {
      recommendation = "neutral";
    }

    const result: ComparisonResult = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      itemName: lowestPriceItem.displayName,
      quantity,
      taskReward,
      marketPrice: lowestPriceItem.price,
      totalMarketCost,
      profitLoss,
      recommendation,
      availableQuantity: lowestPriceItem.totalAvailable,
      seller: lowestPriceItem.owner,
      url: lowestPriceItem.url, // Add this line
      alternativeCount: lowestPriceItem.alternativeCount,
      timestamp: Date.now(),
    };

    setResults([result, ...results]);

    // Clear form after adding
    setItemName("");
    setQuantity(1);
    setTaskReward(0);
    setShowSuggestions(false);
  };

  const getSuggestions = () => {
    if (!itemName) return [];

    const uniqueItems = new Map();
    availableItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(itemName.toLowerCase()) ||
          item.displayName.toLowerCase().includes(itemName.toLowerCase())
      )
      .forEach((item) => {
        const key = item.name;
        if (!uniqueItems.has(key) || uniqueItems.get(key).price > item.price) {
          uniqueItems.set(key, item);
        }
      });

    return Array.from(uniqueItems.values()).slice(0, 5);
  };

  const suggestions = getSuggestions();

  const handleSuggestionClick = (suggestion: (typeof availableItems)[0]) => {
    setItemName(suggestion.displayName);
    setShowSuggestions(false);
    setActiveSuggestion(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && activeSuggestion >= 0) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      } else {
        calculateComparison();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRecommendationBadge = (result: ComparisonResult) => {
    const insufficient =
      result.availableQuantity && result.availableQuantity < result.quantity;

    if (insufficient) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Insufficient Stock
        </Badge>
      );
    }

    switch (result.recommendation) {
      case "buy":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground flex items-center gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Buy from Market
          </Badge>
        );
      case "task":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Complete Task
          </Badge>
        );
      default:
        return <Badge variant="outline">Equal Value</Badge>;
    }
  };

  const removeResult = (id: string) => {
    setResults(results.filter((result) => result.id !== id));
  };

  const clearAllResults = () => {
    setResults([]);
  };

  const exportToExcel = () => {
    if (results.length === 0) return;

    const worksheetData = results.map((result) => ({
      "Item Name": result.itemName,
      Quantity: result.quantity,
      "Task Reward": result.taskReward,
      "Market Price (Each)": result.marketPrice,
      "Total Market Cost": result.totalMarketCost,
      "Profit/Loss": result.profitLoss,
      Recommendation: result.recommendation,
      Seller: result.seller || "N/A",
      "Available Stock": result.availableQuantity || "Unknown",
      "Alternative Sellers": result.alternativeCount || 0,
      "Added Date": new Date(result.timestamp).toLocaleDateString(),
    }));

    // Add summary row
    if (totalStats) {
      worksheetData.push({
        "Item Name": "--- TOTALS ---",

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Quantity: null as any,
        "Task Reward": totalStats.totalReward,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "Market Price (Each)": null as any,
        "Total Market Cost": totalStats.totalMarketCost,
        "Profit/Loss": totalStats.totalProfit,
        Recommendation:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `${totalStats.buyRecommendations} Buy / ${totalStats.taskRecommendations} Task` as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Seller: null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "Available Stock": null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "Alternative Sellers": null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "Added Date": null as any,
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Task Comparisons");

    XLSX.writeFile(
      workbook,
      `task-comparisons-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const importedResults: ComparisonResult[] = jsonData
          .filter(
            (row) => row["Item Name"] && row["Item Name"] !== "--- TOTALS ---"
          )
          .map((row) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            itemName: row["Item Name"],
            quantity: Number(row["Quantity"]) || 1,
            taskReward: Number(row["Task Reward"]) || 0,
            marketPrice: Number(row["Market Price (Each)"]) || 0,
            totalMarketCost: Number(row["Total Market Cost"]) || 0,
            profitLoss: Number(row["Profit/Loss"]) || 0,
            recommendation:
              (row["Recommendation"] as "buy" | "task" | "neutral") ||
              "neutral",
            seller: row["Seller"] !== "N/A" ? row["Seller"] : undefined,
            availableQuantity:
              row["Available Stock"] !== "Unknown"
                ? Number(row["Available Stock"])
                : undefined,
            alternativeCount: Number(row["Alternative Sellers"]) || 0,
            timestamp: Date.now(),
          }));

        setResults([...importedResults, ...results]);
      } catch (error) {
        console.error("Error importing Excel file:", error);
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset input
    event.target.value = "";
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-accent" />
            Task × Market Comparison
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importFromExcel}
              className="hidden"
              id="excel-import"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("excel-import")?.click()}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              disabled={results.length === 0}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2 relative">
            <Label htmlFor="itemName">Item Name</Label>
            <div className="relative">
              <Input
                id="itemName"
                ref={inputRef}
                placeholder="e.g., wheat, anvil, bread"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  setShowSuggestions(true);
                  setActiveSuggestion(0);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="pr-8"
              />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.name}-${index}`}
                    className={`p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                      index === activeSuggestion
                        ? "bg-accent text-accent-foreground"
                        : ""
                    } ${index !== suggestions.length - 1 ? "border-b" : ""}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium">{suggestion.displayName}</div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Price: {suggestion.price.toFixed(2)}</span>
                      <span>Available: {suggestion.availableQuantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskReward">Task Reward</Label>
            <Input
              id="taskReward"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={taskReward || ""}
              onChange={(e) => setTaskReward(Number(e.target.value))}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={calculateComparison}
              className="flex-1  hover:opacity-90 flex items-center gap-1"
              disabled={!itemName || quantity <= 0 || taskReward <= 0}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
            {results.length > 0 && (
              <Button
                onClick={clearAllResults}
                variant="outline"
                className="flex items-center gap-1"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Total Summary */}
        {totalStats && (
          <Card className="bg-gradient-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Tasks:</span>
                  <div className="font-bold text-foreground text-lg">
                    {totalStats.totalTasks}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Rewards:</span>
                  <div className="font-bold text-lg text-yellow-600">
                    {totalStats.totalReward.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Market Cost:</span>
                  <div className="font-bold text-foreground text-lg">
                    {totalStats.totalMarketCost.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Profit:</span>
                  <div
                    className={`font-bold text-lg ${
                      totalStats.totalProfit > 0
                        ? "text-emerald-600"
                        : totalStats.totalProfit < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {totalStats.totalProfit > 0 ? "+" : ""}
                    {totalStats.totalProfit.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Recommendations:
                  </span>
                  <div className="font-bold text-foreground text-lg">
                    {totalStats.buyRecommendations}B/
                    {totalStats.taskRecommendations}T
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Task Comparisons ({results.length})
              </h3>
            </div>

            {results.map((result) => (
              <Card key={result.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {result.itemName} × {result.quantity}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Lowest Price: {result.marketPrice.toFixed(2)} each
                        {result.seller && result.url && (
                          <>
                            {" by "}
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {result.seller}
                            </a>
                          </>
                        )}
                        {result.seller && !result.url && ` by ${result.seller}`}
                        {result.alternativeCount &&
                          result.alternativeCount > 0 && (
                            <span className="text-xs ml-2 text-accent">
                              +{result.alternativeCount} other seller
                              {result.alternativeCount !== 1 ? "s" : ""}
                            </span>
                          )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRecommendationBadge(result)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResult(result.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Task Reward:
                      </span>
                      <div className="font-medium text-accent">
                        {result.taskReward.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">
                        Market Cost:
                      </span>
                      <div className="font-medium">
                        {result.totalMarketCost.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">
                        Profit/Loss:
                      </span>
                      <div
                        className={`font-medium ${
                          result.profitLoss > 0
                            ? "text-success"
                            : result.profitLoss < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {result.profitLoss > 0 ? "+" : ""}
                        {result.profitLoss.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Available:</span>
                      <div className="font-medium">
                        {result.availableQuantity || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {result.availableQuantity &&
                    result.availableQuantity < result.quantity && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Only {result.availableQuantity} available in market.
                          You need {result.quantity}.
                        </AlertDescription>
                      </Alert>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • <span className="text-primary">Buy from Market</span>: Task
              reward is higher than market cost - profitable to buy materials
            </li>
            <li>
              • <span className="text-primary">Gather Resources</span>: Market
              cost is higher than reward - better to Gather Resources yourself
              to complete the task
            </li>
            <li>
              • <strong className="text-primary">Features</strong>: Add multiple
              tasks, view total profit/loss, and export/import Excel
              spreadsheets
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
