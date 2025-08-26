"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Pin, BarChart3, Building2, MapPin } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { industryOptions } from "@/types/land";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PublicLand {
  id: string;
  land_name: string;
  land_link: string;
  industry: { name: string; quantity: number }[];
  created_at: string;
  pinned: boolean;
}

interface PublicLandsTableProps {
  initialLands?: PublicLand[];
}

interface IndustryStats {
  name: string;
  count: number;
  totalQuantity: number;
  percentage: number;
}

export default function PublicLandsTable({
  initialLands = [],
}: PublicLandsTableProps) {
  const supabase = getSupabaseClient();
  const [lands, setLands] = useState<PublicLand[]>(initialLands);
  const [loading, setLoading] = useState(!initialLands.length);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch lands if not provided as initial data
  const fetchLands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("public_land_list")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching public lands:", error);
        return;
      }
      setLands(data || []);
    } catch (error) {
      console.error("Error fetching lands:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!initialLands.length) {
      fetchLands();
    }
  }, [initialLands.length, fetchLands]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalLands = lands.length;
    const pinnedLands = lands.filter((land) => land.pinned).length;

    // Calculate industry statistics
    const industryStats: IndustryStats[] = [];
    const industryMap = new Map<
      string,
      { count: number; totalQuantity: number }
    >();

    lands.forEach((land) => {
      land.industry.forEach((ind) => {
        const existing = industryMap.get(ind.name) || {
          count: 0,
          totalQuantity: 0,
        };
        industryMap.set(ind.name, {
          count: existing.count + 1,
          totalQuantity: existing.totalQuantity + ind.quantity,
        });
      });
    });

    industryOptions.forEach((industry) => {
      const stats = industryMap.get(industry) || { count: 0, totalQuantity: 0 };
      industryStats.push({
        name: industry,
        count: stats.count,
        totalQuantity: stats.totalQuantity,
        percentage:
          totalLands > 0 ? Math.round((stats.count / totalLands) * 100) : 0,
      });
    });

    // Sort by count descending
    industryStats.sort((a, b) => b.count - a.count);

    return {
      totalLands,
      pinnedLands,
      industryStats,
      totalIndustries: industryStats.reduce(
        (sum, stat) => sum + stat.totalQuantity,
        0
      ),
    };
  }, [lands]);

  // Filter and search logic with pinned lands at the top
  const filteredLands = useMemo(() => {
    const filtered = lands.filter((land) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        land.land_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        land.land_link.toLowerCase().includes(searchQuery.toLowerCase());

      // Industry filter
      const matchesIndustry =
        industryFilter === "all" ||
        land.industry.some((ind) => ind.name === industryFilter);

      return matchesSearch && matchesIndustry;
    });

    // Separate pinned lands and regular lands
    const pinnedLands = filtered.filter((land) => land.pinned);
    const regularLands = filtered.filter((land) => !land.pinned);

    // Return pinned lands first, then regular lands
    return [...pinnedLands, ...regularLands];
  }, [lands, searchQuery, industryFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLands.length / itemsPerPage);
  const paginatedLands = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLands.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLands, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Public Lands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Lands Analytics
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Detailed Analytics */}
          {showAnalytics && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <div className="text-2xl font-bold">
                    {analytics.totalLands}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Lands
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <Pin className="h-8 w-8 text-amber-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {analytics.pinnedLands}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pinned Lands
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <Building2 className="h-8 w-8 text-green-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {analytics.industryStats.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Industries
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-2">
                    <span className="text-lg font-bold">∑</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.totalIndustries}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Units
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-4">Industry Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.industryStats.map((stat) => (
                    <div
                      key={stat.name}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="font-medium">{stat.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stat.count} lands</div>
                        <div className="text-sm text-muted-foreground">
                          {stat.totalQuantity} units • {stat.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Lands Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Public Lands Directory</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {filteredLands.length} results
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or link..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
            <Select
              value={industryFilter}
              onValueChange={(value) => {
                setIndustryFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground mb-4">
            Showing {paginatedLands.length} of {filteredLands.length} lands
            {industryFilter !== "all" && ` in ${industryFilter}`}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] bg-muted/50 p-4 font-semibold">
              <div>Name</div>
              <div className="hidden sm:block">Link</div>
              <div>Industries</div>
            </div>
            <div className="divide-y">
              {paginatedLands.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No lands found matching your criteria.
                </div>
              ) : (
                paginatedLands.map((land) => (
                  <div
                    key={land.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] p-4 hover:bg-muted/30 transition-colors ${
                      land.pinned
                        ? "bg-amber-50 dark:bg-amber-950/20 border-b-2 border-amber-200 dark:border-amber-800"
                        : ""
                    }`}
                  >
                    <div className="font-medium mb-2 sm:mb-0 flex items-center">
                      {land.land_name}
                      {land.pinned && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="mb-2 sm:mb-0">
                      <a
                        href={land.land_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {land.land_link.length > 25
                          ? `${land.land_link.substring(0, 25)}...`
                          : land.land_link}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {land.industry.map((ind, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center h-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground"
                        >
                          {ind.name} ({ind.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
