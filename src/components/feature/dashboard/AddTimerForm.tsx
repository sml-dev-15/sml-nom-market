"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTimerRefresherStore } from "@/hooks/use-timer-store";
import { getSupabaseClient } from "@/lib/supabaseClient";

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

  useEffect(() => {
    if (!session || !open) return;

    const fetchLands = async () => {
      const { data, error } = await supabase
        .from("lands")
        .select("*")
        .eq("user_id", session.user.id);

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

      triggerRefresh();
    } catch {
      toast.error("Error", {
        description: "Failed to add timer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Add Timer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Timer</DialogTitle>
          <DialogDescription>Add a timer to a land</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="land" className="text-right">
              Land
            </Label>
            <Select value={selectedLandId} onValueChange={setSelectedLandId}>
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select a land" />
              </SelectTrigger>
              <SelectContent>
                {lands.map((land) => (
                  <SelectItem key={land.id} value={land.id}>
                    {land.owner} - {land.industry?.at(0)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="days" className="text-right">
              Days
            </Label>
            <Input
              id="days"
              type="number"
              min="0"
              value={timeInput.days}
              onChange={(e) =>
                setTimeInput({
                  ...timeInput,
                  days: parseInt(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hours" className="text-right">
              Hours
            </Label>
            <Input
              id="hours"
              type="number"
              min="0"
              max="23"
              value={timeInput.hours}
              onChange={(e) =>
                setTimeInput({
                  ...timeInput,
                  hours: parseInt(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minutes" className="text-right">
              Minutes
            </Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="59"
              value={timeInput.minutes}
              onChange={(e) =>
                setTimeInput({
                  ...timeInput,
                  minutes: parseInt(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seconds" className="text-right">
              Seconds
            </Label>
            <Input
              id="seconds"
              type="number"
              min="0"
              max="59"
              value={timeInput.seconds}
              onChange={(e) =>
                setTimeInput({
                  ...timeInput,
                  seconds: parseInt(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            onClick={handleAddTimer}
            disabled={!selectedLandId || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Timer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
