"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/hooks/useSession";
import { Land } from "@/types/land";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTimerRefresherStore } from "@/hooks/use-timer-store";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Plus, Minus, Clock, Search, ChevronDown } from "lucide-react";

export const AddTimer = () => {
  const supabase = getSupabaseClient();
  const session = useSession();
  const triggerRefresh = useTimerRefresherStore(
    (state) => state.triggerRefresh
  );
  const [lands, setLands] = useState<Land[]>([]);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [timeInput, setTimeInput] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session || !open) return;

    const fetchLands = async () => {
      const { data, error } = await supabase
        .from("lands")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error", {
          description: "Failed to fetch lands",
        });
        return;
      }
      setLands(data || []);
    };

    fetchLands();
  }, [session, open, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter lands based on search query
  const filteredLands = lands.filter((land) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      land.owner.toLowerCase().includes(searchLower) ||
      (land.link && land.link.toLowerCase().includes(searchLower)) ||
      (land.industry &&
        land.industry.some((i) => i.name.toLowerCase().includes(searchLower)))
    );
  });

  const handleAddTimer = async () => {
    if (!selectedLandId || !session) return;

    const totalMilliseconds =
      timeInput.days * 86400000 +
      timeInput.hours * 3600000 +
      timeInput.minutes * 60000 +
      timeInput.seconds * 1000;

    if (totalMilliseconds <= 0) {
      toast.error("Invalid duration", {
        description: "Please set a valid timer duration",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const endTime = new Date(Date.now() + totalMilliseconds).toISOString();

      const { error } = await supabase.from("timers").upsert({
        user_id: session.user.id,
        land_id: selectedLandId,
        end_time: endTime,
      });

      if (error) throw error;

      toast.success("Success", {
        description: "Timer added successfully!",
      });

      setOpen(false);
      setSelectedLandId("");
      setTimeInput({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setSearchQuery("");

      triggerRefresh();
    } catch {
      toast.error("Error", {
        description: "Failed to add timer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementTime = (field: keyof typeof timeInput, max?: number) => {
    setTimeInput((prev) => {
      const currentValue = prev[field];
      if (max !== undefined && currentValue >= max) return prev;

      return {
        ...prev,
        [field]: currentValue + 1,
      };
    });
  };

  const decrementTime = (field: keyof typeof timeInput) => {
    setTimeInput((prev) => {
      const currentValue = prev[field];
      if (currentValue <= 0) return prev;

      return {
        ...prev,
        [field]: currentValue - 1,
      };
    });
  };

  const handleTimeInputChange = (
    field: keyof typeof timeInput,
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    let maxValue: number | undefined;

    switch (field) {
      case "hours":
        maxValue = 23;
        break;
      case "minutes":
        maxValue = 59;
        break;
      case "seconds":
        maxValue = 59;
        break;
    }

    setTimeInput((prev) => ({
      ...prev,
      [field]: maxValue !== undefined ? Math.min(numValue, maxValue) : numValue,
    }));
  };

  // Calculate total time for display
  const totalTimeDisplay = () => {
    const { days, hours, minutes, seconds } = timeInput;
    if (days + hours + minutes + seconds === 0) return "0 seconds";

    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

    return parts.join(", ");
  };

  const selectedLand = lands.find((land) => land.id === selectedLandId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 whitespace-nowrap w-full sm:w-auto">
          <Clock className="w-4 h-4" />
          Add Timer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-muted-foreground hover:text-foreground">
            Add Timer
          </DialogTitle>
          <DialogDescription>
            Set a timer for when your land will be ready
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Land Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="land"
              className="text-muted-foreground hover:text-foreground"
            >
              Select Land
            </Label>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center justify-between w-full p-3 border rounded-md cursor-pointer bg-background"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedLand ? (
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {selectedLand.owner}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selectedLand.industry?.map((i) => i.name).join(", ")}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Choose a land</span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 border rounded-md shadow-md bg-background max-h-60 overflow-auto">
                  <div className="sticky top-0 z-10 bg-background p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search lands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="p-1">
                    {filteredLands.map((land) => (
                      <div
                        key={land.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedLandId === land.id ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedLandId(land.id);
                          setIsDropdownOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {land.owner}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {land.industry?.map((i) => i.name).join(", ")}
                          </span>
                          {lands[0]?.id === land.id && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                              Latest
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredLands.length === 0 && (
                      <div className="p-2 text-center text-muted-foreground">
                        No lands found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedLand && (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedLand.owner}
                </span>
                {selectedLand.link && (
                  <span className="w-[300px] block truncate text-foreground">
                    Link: {selectedLand.link}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Time Input Section */}
          <div className="space-y-4">
            <Label className="text-muted-foreground hover:text-foreground">
              Set Timer Duration
            </Label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Days", field: "days", max: undefined },
                { label: "Hours", field: "hours", max: 23 },
                { label: "Minutes", field: "minutes", max: 59 },
                { label: "Seconds", field: "seconds", max: 59 },
              ].map(({ label, field, max }) => (
                <div key={field} className="space-y-2">
                  <Label className="text-xs text-foreground">{label}</Label>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() =>
                        decrementTime(field as keyof typeof timeInput)
                      }
                    >
                      <Minus className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max={max}
                      value={timeInput[field as keyof typeof timeInput]}
                      onChange={(e) =>
                        handleTimeInputChange(
                          field as keyof typeof timeInput,
                          e.target.value
                        )
                      }
                      className="h-8 text-center border-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        incrementTime(field as keyof typeof timeInput, max)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total time display */}
            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="font-medium text-foreground">Total duration:</div>
              <div className="text-foreground">{totalTimeDisplay()}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTimer}
            disabled={!selectedLandId || isSubmitting}
            className="min-w-24"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Timer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
