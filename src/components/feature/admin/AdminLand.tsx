"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AddPublicLandForm } from "./AdminAddLand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, X, Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { industryOptions } from "@/types/land";
import { toast } from "sonner";

interface IndustryOption {
  name: string;
  quantity: number;
}

interface PublicLand {
  id: string;
  land_name: string;
  land_link: string;
  industry: IndustryOption[];
  created_at: string;
}

// Helper function to truncate URLs
const truncateLink = (url: string, maxLength: number = 40) => {
  if (url.length <= maxLength) return url;

  // Remove protocol and www for cleaner truncation
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/i, "");

  if (cleanUrl.length <= maxLength) return cleanUrl;

  return cleanUrl.substring(0, maxLength - 3) + "...";
};

export default function AdminLand() {
  const supabase = getSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lands, setLands] = useState<PublicLand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit state
  const [editingLand, setEditingLand] = useState<PublicLand | null>(null);
  const [editName, setEditName] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editIndustries, setEditIndustries] = useState<IndustryOption[]>([]);
  const [editSearchQuery, setEditSearchQuery] = useState("");

  // fetch all lands
  const fetchLands = useCallback(async () => {
    const { data, error } = await supabase
      .from("public_land_list")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching public lands:", error);
      return;
    }
    setLands(data || []);
  }, [supabase]);

  // delete land
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("public_land_list")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting land:", error);
      toast.error("Failed to delete land: " + error.message);
      return;
    }
    setLands((prev) => prev.filter((l) => l.id !== id));
    toast.success("Land deleted successfully!");
  };

  // open edit dialog
  const handleEdit = (land: PublicLand) => {
    setEditingLand(land);
    setEditName(land.land_name);
    setEditLink(land.land_link);
    setEditIndustries(land.industry || []);
    setEditSearchQuery("");
  };

  // Industry management functions
  const toggleIndustry = (industry: string) => {
    setEditIndustries((prev) => {
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
    setEditIndustries((prev) =>
      prev.map((item) =>
        item.name === industry ? { ...item, quantity } : item
      )
    );
  };

  const incrementQuantity = (industry: string) => {
    setEditIndustries((prev) =>
      prev.map((item) =>
        item.name === industry ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (industry: string) => {
    setEditIndustries((prev) =>
      prev.map((item) =>
        item.name === industry && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeIndustry = (industry: string) => {
    setEditIndustries((prev) => prev.filter((item) => item.name !== industry));
  };

  // save edit
  const saveEdit = async () => {
    if (!editingLand) return;

    if (!editName || !editLink) {
      toast.error("Please fill in land name and link.");
      return;
    }

    const { error } = await supabase
      .from("public_land_list")
      .update({
        land_name: editName,
        land_link: editLink,
        industry: editIndustries,
      })
      .eq("id", editingLand.id);

    if (error) {
      console.error("Error updating land:", error);
      toast.error("Failed to update land: " + error.message);
      return;
    }

    setLands((prev) =>
      prev.map((l) =>
        l.id === editingLand.id
          ? {
              ...l,
              land_name: editName,
              land_link: editLink,
              industry: editIndustries,
            }
          : l
      )
    );
    setEditingLand(null);
    toast.success("Land updated successfully!");
  };

  // check admin role
  const checkAdmin = useCallback(
    async (id: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", id)
        .maybeSingle();

      if (error || !data || data.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUserRole(data.role);
    },
    [supabase, router]
  );

  const getSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      router.push("/login");
      return;
    }
    const user = data.session.user;
    await checkAdmin(user.id);
    await fetchLands();
    setLoading(false);
  }, [supabase, router, checkAdmin, fetchLands]);

  useEffect(() => {
    getSession();
  }, [getSession]);

  // Filter industries based on search query
  const filteredIndustries = industryOptions.filter((industry) =>
    industry.toLowerCase().includes(editSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-6 p-8">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-10 w-24 mx-auto rounded-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userRole) return null;

  // filter lands by search
  const filteredLands = lands.filter(
    (land) =>
      land.land_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.land_link.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/50">
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>All Public Lands</CardTitle>
              <AddPublicLandForm setLands={setLands} />
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="flex items-center mb-4 gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {filteredLands.length === 0 ? (
              <p className="text-muted-foreground">No lands found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Link</th>
                      <th className="text-left p-2 hidden md:table-cell">
                        Industries
                      </th>
                      <th className="text-left p-2 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLands.map((land) => (
                      <tr key={land.id} className="border-b hover:bg-accent/30">
                        <td className="p-2">{land.land_name}</td>
                        <td className="p-2">
                          <a
                            href={land.land_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                            title={land.land_link}
                          >
                            {truncateLink(land.land_link)}
                          </a>
                        </td>
                        <td className="p-2 hidden md:table-cell">
                          {land.industry
                            .map((i) => `${i.name} (${i.quantity})`)
                            .join(", ")}
                        </td>
                        <td className="p-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(land)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(land.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLand} onOpenChange={() => setEditingLand(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Land</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="editLandName" className="text-foreground">
                  Land Name
                </Label>
                <Input
                  type="text"
                  id="editLandName"
                  placeholder="Enter land name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-foreground"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="editLandLink" className="text-foreground">
                  Land Link
                </Label>
                <Input
                  type="text"
                  id="editLandLink"
                  placeholder="Enter land link"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  className="text-foreground"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Industries</Label>

              {/* Selected industries badges */}
              {editIndustries.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {editIndustries.map((industry) => (
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
                  value={editSearchQuery}
                  onChange={(e) => setEditSearchQuery(e.target.value)}
                />
              </div>

              {/* Industry selection grid */}
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {filteredIndustries.map((industry) => {
                    const isSelected = editIndustries.some(
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
                            id={`edit-industry-${industry}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleIndustry(industry)}
                          />
                          <Label
                            htmlFor={`edit-industry-${industry}`}
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
                                  editIndustries.find(
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
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingLand(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
