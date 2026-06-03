"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { DataTable } from "@/components/ui/data-table";
import { dataColumns } from "./components/Column";
import { BestDealFinder } from "./components/BestDealFinder";
import { useMarketStore } from "@/hooks/buy-toggle";
import { useFetchMarketData } from "@/hooks/data-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  RefreshCw,
  BarChart3,
  Sparkles,
  Package,
  ShoppingCart,
  Users,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MarketType = "toBuy" | "toSell";

const MARKET_TABS = {
  toBuy: {
    title: "For Sale",
    shortTitle: "Selling",
    description: "Items listed for purchase",
    icon: Package,
  },
  toSell: {
    title: "Wants to Buy",
    shortTitle: "Buying",
    description: "Buy orders — sell to these players",
    icon: ShoppingCart,
  },
} as const;

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
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

function EmptyState({
  icon: Icon,
  title,
  description,
  onRefresh,
}: {
  icon: typeof BarChart3;
  title: string;
  description: string;
  onRefresh: () => void;
}) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="font-mono font-semibold text-foreground">{title}</p>
      <p className="text-sm font-mono mt-1 max-w-md mx-auto">{description}</p>
      <Button onClick={onRefresh} variant="outline" className="mt-4 font-mono">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  );
}

export const Hero = () => {
  const { marketType, setMarketType } = useMarketStore();
  const {
    data: forSaleData,
    loading: loadingForSale,
    error: errorForSale,
    refetch: refetchForSale,
  } = useFetchMarketData("toBuy");
  const {
    data: buyOrderData,
    loading: loadingBuyOrders,
    error: errorBuyOrders,
    refetch: refetchBuyOrders,
  } = useFetchMarketData("toSell");

  const [activeView, setActiveView] = useState<"table" | "deals">("table");

  const data = marketType === "toBuy" ? forSaleData : buyOrderData;
  const loading = marketType === "toBuy" ? loadingForSale : loadingBuyOrders;
  const error = marketType === "toBuy" ? errorForSale : errorBuyOrders;

  const refetch = () => {
    refetchForSale();
    refetchBuyOrders();
  };

  const marketStats = useMemo(() => {
    const current = data ?? [];
    const sellers = new Set(current.map((item) => item.owner).filter(Boolean));
    const items = new Set(current.map((item) => item.slug).filter(Boolean));
    const categories = new Set(
      current.map((item) => item.category).filter(Boolean)
    );

    return {
      sellers: sellers.size,
      uniqueItems: items.size,
      categories: categories.size,
    };
  }, [data]);

  const MarketTabIcon = MARKET_TABS[marketType].icon;

  return (
    <div className="w-full py-8">
      <Container>
        <Card className="bg-card border-border shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-mono flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Marketplace
              </div>
              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                disabled={loadingForSale || loadingBuyOrders}
                className="font-mono shrink-0"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </CardTitle>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Browse live listings, compare prices, and find the best deals.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <SummaryCard
                icon={<Package className="h-4 w-4 text-chart-4" />}
                title="For Sale"
                value={formatNumber(forSaleData?.length ?? 0)}
                subValue="Items you can purchase"
                accentClass="border-chart-4/25 bg-chart-4/5"
              />
              <SummaryCard
                icon={<ShoppingCart className="h-4 w-4 text-chart-3" />}
                title="Wants to Buy"
                value={formatNumber(buyOrderData?.length ?? 0)}
                subValue="Buy orders on the market"
                accentClass="border-chart-3/25 bg-chart-3/5"
              />
              <SummaryCard
                icon={<Users className="h-4 w-4 text-primary" />}
                title="Active Sellers"
                value={formatNumber(marketStats.sellers)}
                subValue={`In current ${MARKET_TABS[marketType].title.toLowerCase()} view`}
                accentClass="border-primary/25 bg-primary/5"
              />
              <SummaryCard
                icon={<LayoutGrid className="h-4 w-4 text-blue-400" />}
                title="Unique Items"
                value={formatNumber(marketStats.uniqueItems)}
                subValue={`${marketStats.categories} categories`}
                accentClass="border-blue-500/25 bg-blue-500/5"
              />
            </div>

            {/* Market type tabs */}
            <Tabs
              value={marketType}
              onValueChange={(value) => setMarketType(value as MarketType)}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <TabsList className="font-mono w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto gap-1 p-1">
                  <TabsTrigger
                    value="toBuy"
                    className="gap-1 sm:gap-2 font-mono text-xs sm:text-sm min-w-0 px-2 sm:px-3 py-2"
                  >
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate sm:hidden">
                      {MARKET_TABS.toBuy.shortTitle}
                    </span>
                    <span className="truncate hidden sm:inline">
                      {MARKET_TABS.toBuy.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto sm:ml-1 font-mono text-[10px] sm:text-xs shrink-0 tabular-nums"
                    >
                      {forSaleData?.length ?? 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="toSell"
                    className="gap-1 sm:gap-2 font-mono text-xs sm:text-sm min-w-0 px-2 sm:px-3 py-2"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate sm:hidden">
                      {MARKET_TABS.toSell.shortTitle}
                    </span>
                    <span className="truncate hidden sm:inline">
                      {MARKET_TABS.toSell.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto sm:ml-1 font-mono text-[10px] sm:text-xs shrink-0 tabular-nums"
                    >
                      {buyOrderData?.length ?? 0}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
                <Badge variant="outline" className="font-mono text-xs w-fit shrink-0">
                  {MARKET_TABS[marketType].description}
                </Badge>
              </div>
            </Tabs>

            {/* View tabs */}
            <Tabs
              value={activeView}
              onValueChange={(value) => setActiveView(value as "table" | "deals")}
              className="w-full"
            >
              <TabsList className="font-mono w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto gap-1 p-1">
                <TabsTrigger
                  value="table"
                  className="gap-1 sm:gap-2 font-mono text-xs sm:text-sm px-2 sm:px-3 py-2"
                >
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="sm:hidden">Table</span>
                  <span className="hidden sm:inline">Market Table</span>
                </TabsTrigger>
                <TabsTrigger
                  value="deals"
                  className="gap-1 sm:gap-2 font-mono text-xs sm:text-sm px-2 sm:px-3 py-2"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  Best Deals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="mt-4">
                <Card className="shadow-sm border-border/80">
                  <CardContent className="p-0 sm:p-2">
                    {loading ? (
                      <div className="space-y-3 p-4">
                        <Skeleton className="h-10 w-full max-w-md" />
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : error ? (
                      <Alert variant="destructive" className="m-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-mono">
                          Error Loading Data
                        </AlertTitle>
                        <AlertDescription className="font-mono">
                          {error}. Please try refreshing or check your connection.
                        </AlertDescription>
                        <Button
                          onClick={refetch}
                          variant="outline"
                          size="sm"
                          className="mt-4 font-mono"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </Alert>
                    ) : data && data.length > 0 ? (
                      <DataTable
                        filterColumn="name"
                        columns={dataColumns(marketType)}
                        data={data}
                      />
                    ) : (
                      <EmptyState
                        icon={MarketTabIcon}
                        title="No listings available"
                        description={`There are no ${MARKET_TABS[marketType].title.toLowerCase()} listings right now.`}
                        onRefresh={refetch}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deals" className="mt-4">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-mono">Error Loading Data</AlertTitle>
                    <AlertDescription className="font-mono">{error}</AlertDescription>
                    <Button
                      onClick={refetch}
                      variant="outline"
                      size="sm"
                      className="mt-4 font-mono"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </Alert>
                ) : data && data.length > 0 ? (
                  <BestDealFinder data={data} />
                ) : (
                  <Card className="shadow-sm border-border/80">
                    <CardContent className="p-0">
                      <EmptyState
                        icon={Sparkles}
                        title="No deals to show"
                        description={`No ${MARKET_TABS[marketType].title.toLowerCase()} listings available for deal analysis.`}
                        onRefresh={refetch}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Alert className="bg-accent/10 border-accent/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-foreground font-mono">
                Marketplace tips:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                <li>
                  • <strong>For Sale</strong> — browse items you can purchase from
                  sellers
                </li>
                <li>
                  • <strong>Wants to Buy</strong> — browse buy orders where you can
                  sell your items
                </li>
                <li>
                  • Use filters in the table to narrow by category, name, or column
                </li>
                <li>
                  • Switch to <strong>Best Deals</strong> to find the lowest prices
                  per item or category
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </Container>
    </div>
  );
};
