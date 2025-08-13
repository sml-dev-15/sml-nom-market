import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Session } from "@supabase/supabase-js";
import { industryOptions, Land } from "@/types/land";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface IndustryOption {
  name: string;
  quantity: number;
}

interface AddLandFormProps {
  session: Session;
  setLands: React.Dispatch<React.SetStateAction<Land[]>>;
}

export const AddLandForm = ({ session, setLands }: AddLandFormProps) => {
  const supabase = getSupabaseClient();
  const [landName, setLandName] = useState("");
  const [landLink, setLandLink] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<
    IndustryOption[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setSelectedIndustries((prev) =>
      prev.map((item) =>
        item.name === industry ? { ...item, quantity } : item
      )
    );
  };

  const handleAddLand = async () => {
    if (!landName || !landLink || !session) {
      alert("Please fill in land name and link.");
      return;
    }

    const { data, error } = await supabase
      .from("lands")
      .insert([
        {
          owner: landName,
          link: landLink,
          industry: selectedIndustries,
          user_id: session.user.id,
        },
      ])
      .select();

    if (error) {
      alert("Failed to add land: " + error.message);
      return;
    }

    setLands((prev) => [data[0], ...prev]);
    setLandName("");
    setLandLink("");
    setSelectedIndustries([]);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Add New Land
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Land</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="landName">Land Name</Label>
              <Input
                type="text"
                id="landName"
                placeholder="Enter land name"
                value={landName}
                onChange={(e) => setLandName(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="landLink">Land Link</Label>
              <Input
                type="text"
                id="landLink"
                placeholder="Enter land link"
                value={landLink}
                onChange={(e) => setLandLink(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Industries</Label>
            <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>
                    {selectedIndustries.length > 0
                      ? `${selectedIndustries.length} selected`
                      : "Select industries"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[375px] max-w-[425px] p-2">
                <div className="space-y-2 max-h-60 w-full overflow-y-auto">
                  {industryOptions.map((industry) => {
                    const selected = selectedIndustries.find(
                      (item) => item.name === industry
                    );
                    return (
                      <div
                        key={industry}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`industry-${industry}`}
                            checked={!!selected}
                            onCheckedChange={() => toggleIndustry(industry)}
                          />
                          <Label htmlFor={`industry-${industry}`}>
                            {industry}
                          </Label>
                        </div>
                        {selected && (
                          <Input
                            type="number"
                            min={1}
                            value={selected.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                industry,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 h-8"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddLand}>Add Land</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
