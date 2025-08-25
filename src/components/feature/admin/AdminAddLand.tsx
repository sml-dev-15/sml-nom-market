"use client";

import { useState } from "react";
import { X, Plus, Minus, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { industryOptions } from "@/types/land"; // you can reuse the same options

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
    if (!landName || !landLink) {
      toast.error("Please fill in land name and link.");
      return;
    }

    const { data, error } = await supabase
      .from("public_land_list")
      .insert([
        {
          land_name: landName,
          land_link: landLink,
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
  };

  // Filter industries based on search query
  const filteredIndustries = industryOptions.filter((industry) =>
    industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Public Land
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Public Land</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="landName" className="text-foreground">
                Land Name
              </Label>
              <Input
                type="text"
                id="landName"
                placeholder="Enter land name"
                value={landName}
                onChange={(e) => setLandName(e.target.value)}
                className="text-foreground"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="landLink" className="text-foreground">
                Land Link
              </Label>
              <Input
                type="text"
                id="landLink"
                placeholder="Enter land link"
                value={landLink}
                onChange={(e) => setLandLink(e.target.value)}
                className="text-foreground"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Industries</Label>

            {/* Selected industries badges */}
            {selectedIndustries.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {selectedIndustries.map((industry) => (
                  <Badge
                    key={industry.name}
                    variant="secondary"
                    className="px-2 py-1 flex items-center gap-2 text-foreground"
                  >
                    <span>{industry.name}</span>
                    <div className="flex items-center bg-muted rounded-md">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-none text-foreground"
                        onClick={() => decrementQuantity(industry.name)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-1 text-xs text-foreground">
                        {industry.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-none text-foreground"
                        onClick={() => incrementQuantity(industry.name)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full ml-1 text-foreground"
                      onClick={() => removeIndustry(industry.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search industries..."
                className="pl-8 text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Industry selection grid */}
            <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredIndustries.map((industry) => {
                  const isSelected = selectedIndustries.some(
                    (item) => item.name === industry
                  );

                  return (
                    <div
                      key={industry}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox
                          id={`industry-${industry}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleIndustry(industry)}
                        />
                        <Label
                          htmlFor={`industry-${industry}`}
                          className="cursor-pointer flex-1 text-foreground"
                        >
                          {industry}
                        </Label>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Quantity:
                          </span>
                          <div className="flex items-center border rounded-md">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none text-foreground"
                              onClick={() => decrementQuantity(industry)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              value={
                                selectedIndustries.find(
                                  (item) => item.name === industry
                                )?.quantity || 1
                              }
                              onChange={(e) =>
                                updateQuantity(
                                  industry,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-12 h-7 border-0 text-center rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none text-foreground"
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
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleAddLand}>Add Land</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
