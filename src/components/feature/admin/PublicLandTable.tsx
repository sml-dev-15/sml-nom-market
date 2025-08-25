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
import { Search } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { industryOptions } from "@/types/land";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicLand {
  id: string;
  land_name: string;
  land_link: string;
  industry: { name: string; quantity: number }[];
  created_at: string;
}

interface PublicLandsTableProps {
  initialLands?: PublicLand[];
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

  // Fetch lands if not provided as initial data
  const fetchLands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("public_land_list")
        .select("*")
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

  // Filter and search logic with Samflower pinned to top
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

    // Separate Samflower lands and other lands
    const samflowerLands = filtered.filter((land) =>
      land.land_name.toLowerCase().includes("samflower")
    );
    const otherLands = filtered.filter(
      (land) => !land.land_name.toLowerCase().includes("samflower")
    );

    // Return Samflower lands first, then others
    return [...samflowerLands, ...otherLands];
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Public Lands Directory</CardTitle>
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
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={industryFilter}
            onValueChange={(value) => {
              setIndustryFilter(value);
              setCurrentPage(1); // Reset to first page when filtering
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
              paginatedLands.map((land) => {
                const isSamflower = land.land_name
                  .toLowerCase()
                  .includes("samflower");

                return (
                  <div
                    key={land.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] p-4 hover:bg-muted/30 transition-colors ${
                      isSamflower
                        ? "bg-amber-50 dark:bg-amber-950/20 border-b-2 border-amber-200 dark:border-amber-800"
                        : ""
                    }`}
                  >
                    <div className="font-medium mb-2 sm:mb-0">
                      {land.land_name}
                      {isSamflower && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
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
                        {land.land_link.length > 30
                          ? `${land.land_link.substring(0, 30)}...`
                          : land.land_link}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {land.industry.map((ind, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground"
                        >
                          {ind.name} ({ind.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
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
  );
}
