"use client";

import { Container } from "@/components/ui/container";
import { DataTable } from "@/components/ui/data-table";
import { dataColumns } from "./components/Column";
import { useMarketStore } from "@/hooks/buy-toggle";
import { useFetchMarketData } from "@/hooks/data-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Hero = () => {
  const { marketType, setMarketType } = useMarketStore();
  const { data, loading, error, refetch } = useFetchMarketData(marketType);
  type MarketType = "toBuy" | "toSell";

  return (
    <div className="w-full min-h-screen rounded-2xl py-8">
      <Container className="relative z-20">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-accent-foreground">
              Market Data
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Explore real-time market data, analyze trends, and make informed
            decisions with our comprehensive market insights.
          </p>
        </div>

        <div className="mb-6">
          <Tabs
            value={marketType}
            onValueChange={(value: string) =>
              setMarketType(value as MarketType)
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[400px] mb-4">
              <TabsTrigger value="toBuy" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                To Buy
              </TabsTrigger>
              <TabsTrigger value="toSell" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                To Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {data?.length || 0} items
            </Badge>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              {error}. Please try refreshing the page or check your connection.
            </AlertDescription>
            <div className="mt-4">
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Alert>
        ) : data && data.length > 0 ? (
          <Card>
            <CardContent className="px-5">
              <DataTable
                filterColumn="name"
                columns={dataColumns(marketType)}
                data={data}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto bg-muted rounded-full p-4 w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No market data available
              </h3>
              <p className="text-muted-foreground mb-4">
                There&apos;s currently no data for the selected market type.
              </p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{data?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Store className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Type</p>
                  <p className="text-xl font-bold capitalize">{marketType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-slate-800 dark:to-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};
