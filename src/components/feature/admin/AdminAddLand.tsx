"use client";

import { useState, useMemo } from "react";
import { X, Plus, Minus, Search, MapPin, Link, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { industryOptions } from "@/types/land";

interface IndustryOption {
  name: string;
  quantity: number;
}

interface AddPublicLandFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setLands: React.Dispatch<React.SetStateAction<any[]>>;
}

export const AddPublicLandForm = ({ setLands }: AddPublicLandFormProps) => {
  const supabase = getSupabaseClient();
  const [landName, setLandName] = useState("");
  const [landLink, setLandLink] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<
    IndustryOption[]
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) => {
      const existingIndex = prev.findIndex((item) => item.name === industry);
      if (existingIndex >= 0) {
        return prev.filter((item) => item.name !== industry);
      } else {
        return [...prev, { name: industry, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (industry: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedIndustries((prev) =>
      prev.map((item) =>
        item.name === industry ? { ...item, quantity } : item
      )
    );
  };

  const incrementQuantity = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.map((item) =>
        item.name === industry ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.map((item) =>
        item.name === industry && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.filter((item) => item.name !== industry)
    );
  };

  const handleAddLand = async () => {
    if (!landName.trim()) {
      toast.error("Please enter a land name");
      return;
    }

    if (!landLink.trim()) {
      toast.error("Please enter a land link");
      return;
    }

    // Basic URL validation
    try {
      new URL(landLink);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    if (selectedIndustries.length === 0) {
      toast.error("Please select at least one industry");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("public_land_list")
        .insert([
          {
            land_name: landName.trim(),
            land_link: landLink.trim(),
            industry: selectedIndustries,
          },
        ])
        .select();

      if (error) {
        toast.error("Failed to add public land: " + error.message);
        return;
      }

      toast.success("Land added successfully!");
      setLands((prev) => [data[0], ...prev]);
      setLandName("");
      setLandLink("");
      setSelectedIndustries([]);
      setDialogOpen(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter industries based on search query
  const filteredIndustries = useMemo(() => {
    return industryOptions.filter((industry) =>
      industry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 whitespace-nowrap w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Public Land
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Public Land
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Land Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Land Details
            </h3>

            <div className="space-y-3">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="landName" className="text-foreground text-sm">
                  Land Name *
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="landName"
                    placeholder="Enter land name"
                    value={landName}
                    onChange={(e) => setLandName(e.target.value)}
                    className="text-foreground pl-9"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="landLink" className="text-foreground text-sm">
                  Land URL *
                </Label>
                <div className="relative">
                  <Input
                    type="url"
                    id="landLink"
                    placeholder="https://example.com"
                    value={landLink}
                    onChange={(e) => setLandLink(e.target.value)}
                    className="text-foreground pl-9"
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Industries Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Industries *
            </h3>

            {/* Selected industries chips */}
            {selectedIndustries.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Selected industries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedIndustries.map((industry) => (
                    <div
                      key={industry.name}
                      className="flex items-center gap-1 bg-secondary/50 rounded-full pl-3 pr-1 py-1 border"
                    >
                      <span className="text-xs font-medium">
                        {industry.name}
                      </span>
                      <div className="flex items-center bg-background rounded-full">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full text-foreground hover:bg-muted"
                          onClick={() => decrementQuantity(industry.name)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-1 text-xs font-medium min-w-[1rem] text-center">
                          {industry.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full text-foreground hover:bg-muted"
                          onClick={() => incrementQuantity(industry.name)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full text-foreground hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => removeIndustry(industry.name)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search and industry selection */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search industries..."
                  className="pl-9 text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Industry selection list */}
              <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                {filteredIndustries.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No industries found. Try a different search term.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredIndustries.map((industry) => {
                      const isSelected = selectedIndustries.some(
                        (item) => item.name === industry
                      );
                      const quantity =
                        selectedIndustries.find(
                          (item) => item.name === industry
                        )?.quantity || 1;

                      return (
                        <div
                          key={industry}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isSelected
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-accent"
                          } transition-colors`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Checkbox
                              id={`industry-${industry}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleIndustry(industry)}
                              className="flex-shrink-0"
                            />
                            <Label
                              htmlFor={`industry-${industry}`}
                              className="cursor-pointer flex-1 text-foreground text-sm truncate"
                              title={industry}
                            >
                              {industry}
                            </Label>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center border rounded-md bg-background">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-none text-foreground hover:bg-muted"
                                  onClick={() => decrementQuantity(industry)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min={1}
                                  value={quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      industry,
                                      Math.max(1, parseInt(e.target.value) || 1)
                                    )
                                  }
                                  className="w-10 h-7 border-0 text-center rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-none text-foreground hover:bg-muted"
                                  onClick={() => incrementQuantity(industry)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end px-6 py-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddLand}
            disabled={isSubmitting}
            className="order-1 sm:order-2 sm:ml-2"
          >
            {isSubmitting ? "Adding..." : "Add Land"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
