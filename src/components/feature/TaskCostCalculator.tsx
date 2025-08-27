"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchMarketData } from "@/hooks/data-fetch";
import recipes from "@/data/recipe.json";
import { slugs } from "@/data/slug";
import {
  ChevronsUpDown,
  Plus,
  Trash2,
  Calculator,
  Sparkles,
  Info,
  ChevronDown,
  ChevronRight,
  Package,
  Coins,
  TrendingUp,
  Search,
  Menu,
  Check,
  X,
  Crown,
} from "lucide-react";
import React from "react";

interface Row {
  id: number;
  item: string; // slug
  quantity: number;
  reward: number;
  calculated: boolean; // Track if this row has been calculated
}

interface Recipe {
  slug: string;
  ingredients: { item: string; quantity: number }[];
  produces: { quantity: number };
}

interface IngredientBreakdown {
  item: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  source: string; // 'buy' or 'craft'
}

function formatSlug(slug: string) {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CraftingCostComparison() {
  const { data: toBuyData, loading, error } = useFetchMarketData("toBuy");
  const [rows, setRows] = useState<Row[]>([]);
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shouldCalculate, setShouldCalculate] = useState(false);

  const addRow = () => {
    const newId = Date.now();
    setRows([
      ...rows,
      { id: newId, item: "", quantity: 1, reward: 0, calculated: false },
    ]);
    setOpenPopovers({ ...openPopovers, [newId]: false });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateRow = (id: number, field: keyof Row, value: any) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              calculated: field === "item" ? false : row.calculated,
            }
          : row
      )
    );
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
    const newPopovers = { ...openPopovers };
    delete newPopovers[id];
    setOpenPopovers(newPopovers);

    const newExpanded = { ...expandedRows };
    delete newExpanded[id];
    setExpandedRows(newExpanded);
  };

  const togglePopover = (id: number, open: boolean) => {
    setOpenPopovers({ ...openPopovers, [id]: open });
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCalculate = () => {
    // Mark all rows as calculated
    setRows((prev) => prev.map((row) => ({ ...row, calculated: true })));
    setShouldCalculate(true);
  };

  // Filter slugs based on search query
  const filteredSlugs = useMemo(() => {
    if (!searchQuery) return slugs;
    return slugs.filter((slug) =>
      formatSlug(slug).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Floor price from market
  const getLowestBuyPrice = (slug: string): number | null => {
    if (!toBuyData || toBuyData.length === 0) return null;
    const matching = toBuyData.filter((entry) => entry.slug === slug);
    if (matching.length === 0) return null;
    return Math.min(...matching.map((entry) => entry.unitPrice));
  };

  const getRecipe = (slug: string): Recipe | null =>
    recipes.find((r) => r.slug === slug) || null;

  const getDirectCost = (slug: string, quantity: number): number => {
    const unitPrice = getLowestBuyPrice(slug) ?? 0;
    return unitPrice * quantity;
  };

  const getCraftingCost = (slug: string, quantity: number): number | null => {
    const recipe = getRecipe(slug);
    if (!recipe) return null;

    let ingredientCost = 0;
    for (const ing of recipe.ingredients) {
      const ingPrice = getLowestBuyPrice(ing.item) ?? 0;
      ingredientCost += ingPrice * ing.quantity;
    }

    const perUnitCost = ingredientCost / (recipe.produces?.quantity || 1);
    return perUnitCost * quantity;
  };

  // Get ingredient breakdown for crafting
  const getIngredientBreakdown = (
    slug: string,
    quantity: number
  ): IngredientBreakdown[] | null => {
    const recipe = getRecipe(slug);
    if (!recipe) return null;

    const multiplier = quantity / (recipe.produces?.quantity || 1);
    return recipe.ingredients.map((ing) => ({
      item: ing.item,
      quantity: ing.quantity * multiplier,
      unitPrice: getLowestBuyPrice(ing.item) ?? 0,
      totalCost: (getLowestBuyPrice(ing.item) ?? 0) * ing.quantity * multiplier,
      source: "buy", // Default assumption
    }));
  };

  // Totals = always pick cheapest option
  const totals = useMemo(() => {
    if (!shouldCalculate) {
      return { totalCost: 0, totalReward: 0, totalProfit: 0 };
    }

    return rows.reduce(
      (acc, row) => {
        if (!row.calculated) return acc;

        const directCost = getDirectCost(row.item, row.quantity);
        const craftCost = getCraftingCost(row.item, row.quantity);

        const bestCost =
          craftCost !== null ? Math.min(directCost, craftCost) : directCost;
        const profit = row.reward - bestCost;

        return {
          totalCost: acc.totalCost + bestCost,
          totalReward: acc.totalReward + row.reward,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { totalCost: 0, totalReward: 0, totalProfit: 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, shouldCalculate]);

  const isCraftable = (slug: string): boolean => !!getRecipe(slug);

  // Calculate best option for each item
  const getBestOption = (
    row: Row
  ): { cost: number; method: "buy" | "craft" } => {
    if (!row.calculated) return { cost: 0, method: "buy" };

    const directCost = getDirectCost(row.item, row.quantity);
    const craftCost = getCraftingCost(row.item, row.quantity);

    if (craftCost === null) return { cost: directCost, method: "buy" };

    return directCost <= craftCost
      ? { cost: directCost, method: "buy" }
      : { cost: craftCost, method: "craft" };
  };

  return (
    <div>
      <main>
        <Card className="p-0 rounded-xl shadow-lg border-0  transition-colors duration-300 ">
          <CardHeader className="py-4 bg-gradient-to-r rounded-t-xl transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="w-full flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl md:text-2xl ">
                    <Calculator className="h-5 w-5 md:h-6 md:w-6" />
                    Crafting Cost Comparison
                  </CardTitle>
                  <CardDescription className="max-w-2xl dark:text-gray-300 text-sm md:text-base">
                    Compare buying vs crafting costs to maximize profit.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={addRow} className="gap-1 hidden md:flex">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 space-y-6">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-pulse text-center">
                  <Sparkles className="h-8 w-8 mx-auto text-blue-500 dark:text-blue-400" />
                  <p className="mt-2 text-muted-foreground ">
                    Loading market data...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                <p>Error: {error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {rows.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg ">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground dark:text-gray-500" />
                    <h3 className="mt-4 text-lg font-medium ">
                      No items added
                    </h3>
                    <p className="text-muted-foreground  mb-4">
                      Get started by adding an item to analyze
                    </p>
                    <Button onClick={addRow} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add Your First Item
                    </Button>
                  </div>
                ) : (
                  <>
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2  ">
                        <TabsTrigger
                          value="table"
                          className=" transition-colors text-xs md:text-sm"
                        >
                          Table View
                        </TabsTrigger>
                        <TabsTrigger
                          value="summary"
                          className=" transition-colors text-xs md:text-sm"
                        >
                          Summary View
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="table" className="mt-4">
                        <div className="rounded-md border  overflow-x-auto">
                          <div className="min-w-[700px]">
                            {" "}
                            {/* Force horizontal scroll on mobile */}
                            <Table>
                              <TableHeader className="bg-muted/50 ">
                                <TableRow className="">
                                  <TableHead className="w-[40px]"></TableHead>
                                  <TableHead className="w-[200px]">
                                    Item
                                  </TableHead>
                                  <TableHead className="w-[120px]">
                                    Floor Price
                                  </TableHead>
                                  <TableHead className="w-[100px]">
                                    Quantity
                                  </TableHead>
                                  <TableHead className="w-[120px]">
                                    Reward
                                  </TableHead>
                                  <TableHead className="w-[140px]">
                                    Best Cost
                                  </TableHead>
                                  <TableHead className="w-[140px]">
                                    Profit
                                  </TableHead>
                                  <TableHead className="w-[120px]">
                                    Margin
                                  </TableHead>
                                  <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rows.map((row) => {
                                  const directCost = row.calculated
                                    ? getDirectCost(row.item, row.quantity)
                                    : 0;
                                  const craftCost = row.calculated
                                    ? getCraftingCost(row.item, row.quantity)
                                    : null;
                                  const bestOption = getBestOption(row);
                                  const profit = row.calculated
                                    ? row.reward - bestOption.cost
                                    : 0;
                                  const margin =
                                    row.calculated && row.reward > 0
                                      ? (profit / row.reward) * 100
                                      : 0;
                                  const isExpanded = expandedRows[row.id];
                                  const breakdown = row.calculated
                                    ? getIngredientBreakdown(
                                        row.item,
                                        row.quantity
                                      )
                                    : null;
                                  const floorPrice = getLowestBuyPrice(
                                    row.item
                                  );
                                  const isBuyBetter =
                                    row.calculated &&
                                    craftCost !== null &&
                                    directCost <= craftCost;

                                  return (
                                    <React.Fragment key={row.id}>
                                      <TableRow className="group align-top hover:bg-muted/30 dark:hover:bg-gray-700/30 ">
                                        <TableCell>
                                          {isCraftable(row.item) && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() =>
                                                toggleRowExpansion(row.id)
                                              }
                                            >
                                              {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                            </Button>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <div className="w-[240px] items-center gap-2 mr-5">
                                            <Popover
                                              open={openPopovers[row.id]}
                                              onOpenChange={(open) =>
                                                togglePopover(row.id, open)
                                              }
                                            >
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  role="combobox"
                                                  aria-expanded={
                                                    openPopovers[row.id]
                                                  }
                                                  className="justify-between col-span-2 font-normal  text-xs md:text-sm"
                                                >
                                                  <p className="truncate w-[180px] text-left">
                                                    {row.item
                                                      ? formatSlug(row.item)
                                                      : "Select item..."}
                                                  </p>
                                                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent
                                                className="w-[280px] p-0 "
                                                align="start"
                                              >
                                                <Command className="">
                                                  <div className="flex items-center border-b px-3 ">
                                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                    <CommandInput
                                                      placeholder="Search item..."
                                                      value={searchQuery}
                                                      onValueChange={
                                                        setSearchQuery
                                                      }
                                                      className=""
                                                    />
                                                  </div>
                                                  <CommandList>
                                                    <CommandEmpty>
                                                      No results found.
                                                    </CommandEmpty>
                                                    <CommandGroup className="">
                                                      {filteredSlugs.map(
                                                        (slug) => (
                                                          <CommandItem
                                                            key={slug}
                                                            onSelect={() => {
                                                              updateRow(
                                                                row.id,
                                                                "item",
                                                                slug
                                                              );
                                                              togglePopover(
                                                                row.id,
                                                                false
                                                              );
                                                              setSearchQuery(
                                                                ""
                                                              );
                                                            }}
                                                            className="flex items-center justify-between "
                                                          >
                                                            <span className="text-xs md:text-sm">
                                                              {formatSlug(slug)}
                                                            </span>
                                                            {isCraftable(
                                                              slug
                                                            ) && (
                                                              <Badge
                                                                variant="outline"
                                                                className="ml-2 text-xs "
                                                              >
                                                                Craftable
                                                              </Badge>
                                                            )}
                                                          </CommandItem>
                                                        )
                                                      )}
                                                    </CommandGroup>
                                                  </CommandList>
                                                </Command>
                                              </PopoverContent>
                                            </Popover>
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                >
                                                  <Info className="h-4 w-4 animate-pulse text-emerald-600" />
                                                </Button>
                                              </DialogTrigger>

                                              <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto mx-auto">
                                                <DialogHeader>
                                                  <DialogTitle>
                                                    Cost Analysis:{" "}
                                                    {formatSlug(row.item)}
                                                  </DialogTitle>
                                                  <DialogDescription>
                                                    Detailed cost comparison for{" "}
                                                    {row.quantity}x{" "}
                                                    {formatSlug(row.item)}
                                                  </DialogDescription>
                                                </DialogHeader>

                                                <div className="mt-4 space-y-4">
                                                  {/* Direct Buy vs Crafting Comparison */}
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Card
                                                      className={
                                                        isBuyBetter
                                                          ? "ring-2 ring-green-500"
                                                          : ""
                                                      }
                                                    >
                                                      <CardHeader className="py-3">
                                                        <div className="flex items-center justify-between">
                                                          <CardTitle className="text-sm flex items-center gap-2">
                                                            <Package className="h-4 w-4" />
                                                            Buying Directly
                                                          </CardTitle>
                                                          {isBuyBetter && (
                                                            <div className="flex items-center text-green-600">
                                                              <Crown className="h-4 w-4 mr-1" />
                                                              <span className="text-xs font-medium">
                                                                BEST
                                                              </span>
                                                            </div>
                                                          )}
                                                        </div>
                                                      </CardHeader>
                                                      <CardContent>
                                                        <p className="text-2xl font-bold">
                                                          {row.calculated
                                                            ? directCost.toLocaleString()
                                                            : "N/A"}{" "}
                                                          gold
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                          {getLowestBuyPrice(
                                                            row.item
                                                          )?.toLocaleString() ||
                                                            "N/A"}{" "}
                                                          gold per unit
                                                        </p>
                                                        {row.calculated &&
                                                          craftCost !==
                                                            null && (
                                                            <div className="mt-2 text-sm">
                                                              {directCost <=
                                                              craftCost ? (
                                                                <div className="flex items-center text-green-600">
                                                                  <Check className="h-4 w-4 mr-1" />
                                                                  <span>
                                                                    Save{" "}
                                                                    {(
                                                                      craftCost -
                                                                      directCost
                                                                    ).toLocaleString()}{" "}
                                                                    gold vs
                                                                    crafting
                                                                  </span>
                                                                </div>
                                                              ) : (
                                                                <div className="flex items-center text-red-600">
                                                                  <X className="h-4 w-4 mr-1" />
                                                                  <span>
                                                                    Costs{" "}
                                                                    {(
                                                                      directCost -
                                                                      craftCost
                                                                    ).toLocaleString()}{" "}
                                                                    gold more
                                                                    than
                                                                    crafting
                                                                  </span>
                                                                </div>
                                                              )}
                                                            </div>
                                                          )}
                                                      </CardContent>
                                                    </Card>

                                                    <Card
                                                      className={
                                                        !isBuyBetter &&
                                                        craftCost !== null
                                                          ? "ring-2 ring-green-500"
                                                          : ""
                                                      }
                                                    >
                                                      <CardHeader className="py-3">
                                                        <div className="flex items-center justify-between">
                                                          <CardTitle className="text-sm flex items-center gap-2">
                                                            <Calculator className="h-4 w-4" />
                                                            Crafting
                                                          </CardTitle>
                                                          {!isBuyBetter &&
                                                            craftCost !==
                                                              null && (
                                                              <div className="flex items-center text-green-600">
                                                                <Crown className="h-4 w-4 mr-1" />
                                                                <span className="text-xs font-medium">
                                                                  BEST
                                                                </span>
                                                              </div>
                                                            )}
                                                        </div>
                                                      </CardHeader>
                                                      <CardContent>
                                                        <p className="text-2xl font-bold">
                                                          {row.calculated &&
                                                          craftCost !== null
                                                            ? `${craftCost.toLocaleString()} gold`
                                                            : "Not craftable"}
                                                        </p>
                                                        {row.calculated &&
                                                          craftCost !==
                                                            null && (
                                                            <p className="text-sm text-muted-foreground">
                                                              {(
                                                                craftCost /
                                                                row.quantity
                                                              ).toLocaleString()}{" "}
                                                              gold per unit
                                                            </p>
                                                          )}
                                                        {row.calculated &&
                                                          craftCost !==
                                                            null && (
                                                            <div className="mt-2 text-sm">
                                                              {craftCost <
                                                              directCost ? (
                                                                <div className="flex items-center text-green-600">
                                                                  <Check className="h-4 w-4 mr-1" />
                                                                  <span>
                                                                    Save{" "}
                                                                    {(
                                                                      directCost -
                                                                      craftCost
                                                                    ).toLocaleString()}{" "}
                                                                    gold vs
                                                                    buying
                                                                  </span>
                                                                </div>
                                                              ) : (
                                                                <div className="flex items-center text-red-600">
                                                                  <X className="h-4 w-4 mr-1" />
                                                                  <span>
                                                                    Costs{" "}
                                                                    {(
                                                                      craftCost -
                                                                      directCost
                                                                    ).toLocaleString()}{" "}
                                                                    gold more
                                                                    than buying
                                                                  </span>
                                                                </div>
                                                              )}
                                                            </div>
                                                          )}
                                                      </CardContent>
                                                    </Card>
                                                  </div>

                                                  {/* Reward vs Crafting Comparison */}
                                                  {row.calculated &&
                                                    craftCost !== null && (
                                                      <Card>
                                                        <CardHeader className="py-3">
                                                          <CardTitle className="text-sm flex items-center gap-2">
                                                            <Coins className="h-4 w-4" />
                                                            Reward vs Crafting
                                                            Cost
                                                          </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                          <div className="grid grid-cols-2 gap-4">
                                                            <div className="text-center">
                                                              <p className="text-sm text-muted-foreground">
                                                                Reward
                                                              </p>
                                                              <p className="text-xl font-bold text-green-600">
                                                                {row.reward.toLocaleString()}{" "}
                                                                gold
                                                              </p>
                                                            </div>
                                                            <div className="text-center">
                                                              <p className="text-sm text-muted-foreground">
                                                                Craft Cost
                                                              </p>
                                                              <p className="text-xl font-bold">
                                                                {craftCost.toLocaleString()}{" "}
                                                                gold
                                                              </p>
                                                            </div>
                                                          </div>
                                                          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-center">
                                                            {row.reward >
                                                            craftCost ? (
                                                              <div className="text-green-600">
                                                                <Check className="h-5 w-5 mx-auto mb-1" />
                                                                <p className="font-medium">
                                                                  Profit:{" "}
                                                                  {(
                                                                    row.reward -
                                                                    craftCost
                                                                  ).toLocaleString()}{" "}
                                                                  gold
                                                                </p>
                                                                <p className="text-sm">
                                                                  (
                                                                  {(
                                                                    ((row.reward -
                                                                      craftCost) /
                                                                      craftCost) *
                                                                    100
                                                                  ).toFixed(1)}
                                                                  % return)
                                                                </p>
                                                              </div>
                                                            ) : (
                                                              <div className="text-red-600">
                                                                <X className="h-5 w-5 mx-auto mb-1" />
                                                                <p className="font-medium">
                                                                  Loss:{" "}
                                                                  {(
                                                                    craftCost -
                                                                    row.reward
                                                                  ).toLocaleString()}{" "}
                                                                  gold
                                                                </p>
                                                                <p className="text-sm">
                                                                  (
                                                                  {(
                                                                    ((craftCost -
                                                                      row.reward) /
                                                                      craftCost) *
                                                                    100
                                                                  ).toFixed(1)}
                                                                  % loss)
                                                                </p>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </CardContent>
                                                      </Card>
                                                    )}

                                                  {/* Ingredients Breakdown */}
                                                  {row.calculated &&
                                                    breakdown && (
                                                      <Card className="w-[306px] md:w-full">
                                                        <CardHeader className="py-3">
                                                          <CardTitle className="text-sm">
                                                            Crafting Ingredients
                                                            Required
                                                          </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                          <div className="overflow-x-auto">
                                                            <Table className="min-w-full md:min-w-[500px]">
                                                              <TableHeader>
                                                                <TableRow>
                                                                  <TableHead>
                                                                    Ingredient
                                                                  </TableHead>
                                                                  <TableHead className="text-right">
                                                                    Quantity
                                                                  </TableHead>
                                                                  <TableHead className="text-right">
                                                                    Unit Price
                                                                  </TableHead>
                                                                  <TableHead className="text-right">
                                                                    Total Cost
                                                                  </TableHead>
                                                                </TableRow>
                                                              </TableHeader>
                                                              <TableBody>
                                                                {breakdown.map(
                                                                  (
                                                                    ing,
                                                                    idx
                                                                  ) => (
                                                                    <TableRow
                                                                      key={idx}
                                                                      className="dark:border-gray-600"
                                                                    >
                                                                      <TableCell className="max-w-[120px] md:max-w-none truncate md:whitespace-normal">
                                                                        {formatSlug(
                                                                          ing.item
                                                                        )}
                                                                      </TableCell>
                                                                      <TableCell className="text-right">
                                                                        {ing.quantity.toFixed(
                                                                          2
                                                                        )}
                                                                      </TableCell>
                                                                      <TableCell className="text-right">
                                                                        {ing.unitPrice.toLocaleString()}
                                                                      </TableCell>
                                                                      <TableCell className="text-right">
                                                                        {ing.totalCost.toLocaleString()}
                                                                      </TableCell>
                                                                    </TableRow>
                                                                  )
                                                                )}
                                                              </TableBody>
                                                            </Table>
                                                          </div>
                                                        </CardContent>
                                                      </Card>
                                                    )}
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          </div>
                                        </TableCell>

                                        {/* Floor Price Column */}
                                        <TableCell className="font-mono  text-sm">
                                          {floorPrice
                                            ? floorPrice.toLocaleString()
                                            : "N/A"}
                                        </TableCell>

                                        <TableCell>
                                          <Input
                                            type="number"
                                            min="1"
                                            value={row.quantity}
                                            onChange={(e) =>
                                              updateRow(
                                                row.id,
                                                "quantity",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-16 md:w-20 text-sm"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={row.reward}
                                            onChange={(e) =>
                                              updateRow(
                                                row.id,
                                                "reward",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-20 md:w-28 text-sm"
                                          />
                                        </TableCell>

                                        {/* Best Cost */}
                                        <TableCell className="font-mono  text-sm">
                                          <div className="flex flex-col">
                                            <span>
                                              {row.calculated
                                                ? bestOption.cost.toLocaleString()
                                                : "N/A"}
                                            </span>
                                            {row.calculated && (
                                              <Badge
                                                variant="outline"
                                                className="w-fit mt-1 text-xs dark:border-blue-400 dark:text-blue-400"
                                              >
                                                {bestOption.method}
                                              </Badge>
                                            )}
                                          </div>
                                        </TableCell>

                                        {/* Profit */}
                                        <TableCell className="font-mono text-sm">
                                          <span
                                            className={
                                              row.calculated && profit >= 0
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                            }
                                          >
                                            {row.calculated
                                              ? profit.toLocaleString()
                                              : "N/A"}
                                          </span>
                                        </TableCell>

                                        {/* Margin */}
                                        <TableCell>
                                          {row.calculated ? (
                                            <Badge
                                              variant={
                                                profit >= 0
                                                  ? "secondary"
                                                  : "destructive"
                                              }
                                              className="text-xs"
                                            >
                                              {margin.toFixed(1)}%
                                            </Badge>
                                          ) : (
                                            <span className="text-xs">N/A</span>
                                          )}
                                        </TableCell>

                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRow(row.id)}
                                            className="opacity-70 hover:opacity-100 transition-opacity dark:hover:bg-gray-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>

                                      {/* Expanded row for ingredient breakdown */}
                                      {isExpanded && breakdown && (
                                        <TableRow className="bg-muted/20">
                                          <TableCell colSpan={9}>
                                            <div className="p-4">
                                              <h4 className="font-medium mb-2 flex items-center gap-2  text-sm md:text-base">
                                                <Package className="h-4 w-4" />
                                                Crafting Ingredients for{" "}
                                                {row.quantity}x{" "}
                                                {formatSlug(row.item)}
                                              </h4>
                                              <div className="grid gap-2">
                                                {breakdown.map((ing, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex justify-between items-center text-xs md:text-sm "
                                                  >
                                                    <span className="truncate max-w-[220px]">
                                                      {formatSlug(ing.item)}
                                                    </span>
                                                    <div className="flex items-center gap-2 md:gap-4">
                                                      <span>
                                                        {ing.quantity.toFixed(
                                                          2
                                                        )}
                                                      </span>
                                                      <span className="w-16 md:w-20 text-right">
                                                        ×{" "}
                                                        {ing.unitPrice.toLocaleString()}
                                                      </span>
                                                      <span className="w-20 md:w-24 text-right font-mono">
                                                        ={" "}
                                                        {ing.totalCost.toLocaleString()}{" "}
                                                        gold
                                                      </span>
                                                    </div>
                                                  </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-2 border-t mt-2 dark:border-gray-600">
                                                  <span className="font-medium  text-sm md:text-base">
                                                    Total Crafting Cost
                                                  </span>
                                                  <span className="font-mono font-bold  text-sm md:text-base">
                                                    {row.calculated && craftCost
                                                      ? craftCost.toLocaleString()
                                                      : "N/A"}{" "}
                                                    gold
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Calculate Button */}
                        <div className="mt-4 flex justify-center">
                          <Button onClick={handleCalculate} className="gap-2">
                            <Calculator className="h-4 w-4" />
                            Calculate Costs
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="summary" className="mt-4">
                        <div className="grid gap-4">
                          {rows.map((row) => {
                            const bestOption = getBestOption(row);
                            const profit = row.calculated
                              ? row.reward - bestOption.cost
                              : 0;
                            const margin =
                              row.calculated && row.reward > 0
                                ? (profit / row.reward) * 100
                                : 0;
                            const floorPrice = getLowestBuyPrice(row.item);
                            const directCost = row.calculated
                              ? getDirectCost(row.item, row.quantity)
                              : 0;
                            const craftCost = row.calculated
                              ? getCraftingCost(row.item, row.quantity)
                              : null;
                            const isBuyBetter =
                              row.calculated &&
                              craftCost !== null &&
                              directCost <= craftCost;

                            return (
                              <Card key={row.id} className="relative ">
                                <CardHeader className="py-3 pr-16">
                                  <CardTitle className="text-base ">
                                    {formatSlug(row.item)}
                                  </CardTitle>
                                  <CardDescription className="">
                                    {row.quantity} ×{" "}
                                    {floorPrice?.toLocaleString() || "N/A"} gold
                                    (floor price)
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                      <p className="text-sm text-muted-foreground ">
                                        Floor Price
                                      </p>
                                      <p className="text-lg font-bold ">
                                        {floorPrice?.toLocaleString() || "N/A"}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-muted-foreground ">
                                        Cost
                                      </p>
                                      <p className="text-lg font-bold ">
                                        {row.calculated
                                          ? bestOption.cost.toLocaleString()
                                          : "N/A"}
                                      </p>
                                      {row.calculated && (
                                        <Badge
                                          variant="outline"
                                          className="mt-1 text-xs dark:border-blue-400 dark:text-blue-400"
                                        >
                                          {bestOption.method}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-muted-foreground ">
                                        Reward
                                      </p>
                                      <p className="text-lg font-bold ">
                                        {row.reward.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-muted-foreground ">
                                        Profit
                                      </p>
                                      <p
                                        className={`text-lg font-bold ${
                                          row.calculated && profit >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                      >
                                        {row.calculated
                                          ? profit.toLocaleString()
                                          : "N/A"}
                                      </p>
                                      {row.calculated && (
                                        <Badge
                                          variant={
                                            profit >= 0
                                              ? "secondary"
                                              : "destructive"
                                          }
                                          className="mt-1 text-xs"
                                        >
                                          {margin.toFixed(1)}%
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Direct comparison in summary view */}
                                  {row.calculated && craftCost !== null && (
                                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                      <p className="text-sm font-medium mb-2">
                                        Cost Comparison:
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div
                                          className={
                                            isBuyBetter
                                              ? "text-green-600 font-medium"
                                              : ""
                                          }
                                        >
                                          Buy: {directCost.toLocaleString()}{" "}
                                          gold
                                          {isBuyBetter && " ✓"}
                                        </div>
                                        <div
                                          className={
                                            !isBuyBetter
                                              ? "text-green-600 font-medium"
                                              : ""
                                          }
                                        >
                                          Craft: {craftCost.toLocaleString()}{" "}
                                          gold
                                          {!isBuyBetter && " ✓"}
                                        </div>
                                      </div>
                                      <p className="text-xs mt-2 text-muted-foreground">
                                        {isBuyBetter
                                          ? `Buying saves ${(
                                              craftCost - directCost
                                            ).toLocaleString()} gold`
                                          : `Crafting saves ${(
                                              directCost - craftCost
                                            ).toLocaleString()} gold`}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-3 right-3 h-8 w-8 "
                                  onClick={() => removeRow(row.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Card>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Summary */}
                    <Card className="">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg flex items-center gap-2 ">
                          <TrendingUp className="h-5 w-5" />
                          Summary (Best Option per item)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm dark:shadow-none">
                            <span className="text-sm text-muted-foreground  flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              Total Cost
                            </span>
                            <span className="text-2xl font-bold ">
                              {shouldCalculate
                                ? totals.totalCost.toLocaleString()
                                : "N/A"}{" "}
                              gold
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm dark:shadow-none">
                            <span className="text-sm text-muted-foreground  flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              Total Reward
                            </span>
                            <span className="text-2xl font-bold ">
                              {shouldCalculate
                                ? totals.totalReward.toLocaleString()
                                : "N/A"}{" "}
                              gold
                            </span>
                          </div>
                          <div
                            className={`flex flex-col items-center p-4 rounded-lg shadow-sm dark:shadow-none ${
                              shouldCalculate && totals.totalProfit >= 0
                                ? "bg-green-100/50 dark:bg-green-900/30"
                                : "bg-red-100/50 dark:bg-red-900/30"
                            }`}
                          >
                            <span className="text-sm text-muted-foreground  flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              Total Profit
                            </span>
                            <span
                              className={`text-2xl font-bold ${
                                shouldCalculate && totals.totalProfit >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {shouldCalculate
                                ? totals.totalProfit.toLocaleString()
                                : "N/A"}{" "}
                              gold
                            </span>
                            {shouldCalculate && totals.totalReward > 0 && (
                              <span className="text-sm mt-1 ">
                                {(
                                  (totals.totalProfit / totals.totalReward) *
                                  100
                                ).toFixed(1)}
                                % margin
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Mobile Floating Action Button */}
        {rows.length > 0 && (
          <div className="fixed bottom-4 right-4 md:hidden z-10">
            <Button
              onClick={addRow}
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4">
              <div className="flex flex-col space-y-4">
                <Button onClick={addRow} className="gap-2 justify-start">
                  <Plus className="h-5 w-5" />
                  Add Item
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
