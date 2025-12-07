"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, ArrowRight } from "lucide-react";
import { OwnerProfileView } from "@/components/feature/OwnerProfile";
import { useFetchMarketData } from "@/hooks/data-fetch";

export function ProfileSearch() {
  const [searchOwner, setSearchOwner] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const { data: toBuyData } = useFetchMarketData("toBuy");
  const { data: toSellData } = useFetchMarketData("toSell");

  // Get unique owners from marketplace data
  const uniqueOwners = useMemo(() => {
    const owners = new Set<string>();
    toBuyData?.forEach((item) => {
      if (item.owner) owners.add(item.owner);
    });
    toSellData?.forEach((item) => {
      if (item.owner) owners.add(item.owner);
    });
    return Array.from(owners).sort();
  }, [toBuyData, toSellData]);

  // Filter owners based on search
  const filteredOwners = useMemo(() => {
    if (!searchOwner) return [];
    const searchLower = searchOwner.toLowerCase();
    return uniqueOwners
      .filter((owner) => owner.toLowerCase().includes(searchLower))
      .slice(0, 10);
  }, [uniqueOwners, searchOwner]);

  const handleOwnerSelect = (owner: string) => {
    setSelectedOwner(owner);
    setSearchOwner(owner);
  };

  const handleSearch = () => {
    if (searchOwner.trim()) {
      setSelectedOwner(searchOwner.trim());
    }
  };

  const handleBack = () => {
    setSelectedOwner(null);
    setSearchOwner("");
  };

  if (selectedOwner) {
    return (
      <div className="w-full min-h-screen rounded-2xl py-8">
        <Container className="relative z-20">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Search
            </Button>
          </div>
          <OwnerProfileView ownerId={selectedOwner} />
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen rounded-2xl py-8">
      <Container className="relative z-20">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-accent-foreground">
              Owner Profile Search
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Search for any owner/player to view all their marketplace listings across all their tiles.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-search">Owner Name</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="owner-search"
                      placeholder="Enter owner name (e.g., moonlit, jiro)..."
                      value={searchOwner}
                      onChange={(e) => setSearchOwner(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      className="pr-8"
                    />
                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button onClick={handleSearch} disabled={!searchOwner.trim()}>
                    Search
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {filteredOwners.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Suggestions ({filteredOwners.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {filteredOwners.map((owner) => (
                      <Badge
                        key={owner}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleOwnerSelect(owner)}
                      >
                        {owner}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Owners */}
              {!searchOwner && uniqueOwners.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Popular Owners ({uniqueOwners.length} total)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueOwners.slice(0, 20).map((owner) => (
                      <Badge
                        key={owner}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleOwnerSelect(owner)}
                      >
                        {owner}
                      </Badge>
                    ))}
                  </div>
                  {uniqueOwners.length > 20 && (
                    <p className="text-xs text-muted-foreground">
                      +{uniqueOwners.length - 20} more owners. Use search to find them.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Enter an owner name to view all their marketplace listings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  See all items they&apos;re selling and buying across all their tiles
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Filter, sort, and group listings to find the best deals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Click on any owner name in the marketplace table to view their profile
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
