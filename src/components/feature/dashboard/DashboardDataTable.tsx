"use client";

import { useCallback, useEffect, useState } from "react";
import { createColumns } from "./Column";
import { RegularDataTable } from "../DataTable";
import { useSession } from "@/hooks/useSession";
import { Land } from "@/types/land";
import { useTimerRefresherStore } from "@/hooks/use-timer-store";
import { useTimerStore } from "@/hooks/timer-store";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DashboardDataTable = () => {
  const supabase = getSupabaseClient();
  const session = useSession();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshCount = useTimerRefresherStore((state) => state.refreshCount);
  const { setTimers, removeTimersByLandId, removeTimer } = useTimerStore();

  const fetchData = useCallback(async () => {
    if (!session) return;

    try {
      setRefreshing(true);

      const [
        { data: landsData, error: landsError },
        { data: timersData, error: timersError },
      ] = await Promise.all([
        supabase
          .from("lands")
          .select("id, user_id, owner, link, industry, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase.from("timers").select("*").eq("user_id", session.user.id),
      ]);

      if (landsError || timersError) {
        throw landsError || timersError;
      }

      const transformedTimers = timersData.map((timer) => ({
        id: timer.id,
        landId: timer.land_id,
        endTime: new Date(timer.end_time).getTime(),
      }));
      setTimers(transformedTimers);

      const transformedLands = landsData.map((land) => {
        const landTimers = timersData
          .filter((t) => t.land_id === land.id)
          .map((t) => ({
            id: t.id,
            end_time: t.end_time,
          }));

        return {
          ...land,
          timers: landTimers,
          timerCount: landTimers.length,
        } as Land;
      });

      setLands(transformedLands);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, supabase, setTimers]);

  useEffect(() => {
    fetchData();
  }, [session, refreshCount, setTimers, supabase, fetchData]);

  const handleDelete = async (id: string) => {
    try {
      const { error: landError } = await supabase
        .from("lands")
        .delete()
        .eq("id", id);

      if (landError) throw landError;

      setLands((prev) => prev.filter((land) => land.id !== id));
      removeTimersByLandId(id);

      const { error: timerError } = await supabase
        .from("timers")
        .delete()
        .eq("land_id", id);

      if (timerError)
        console.warn("Could not delete associated timers:", timerError);

      toast.success("Land deleted successfully");
    } catch (err) {
      console.error("Delete error:", err instanceof Error ? err.message : err);
      toast.error("Failed to delete land");
      throw err;
    }
  };

  const handleDeleteTimer = async (timerId: string) => {
    try {
      const { error } = await supabase
        .from("timers")
        .delete()
        .eq("id", timerId);

      if (error) throw error;

      removeTimer(timerId);

      setLands((prev) =>
        prev.map((land) => ({
          ...land,
          timers: land.timers.filter((t) => t.id !== timerId),
        }))
      );

      toast.success("Timer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete timer");
      console.error("Error deleting timer:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <Container className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Container>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load lands: {error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full">
        <Container>
          <Alert>
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to view your lands and timers
            </AlertDescription>
          </Alert>
        </Container>
      </div>
    );
  }

  const columns = createColumns(handleDelete, handleDeleteTimer);

  return (
    <div className="w-full">
      <Container className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Lands</h2>
            <p className="text-muted-foreground">
              Manage your lands and their timers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lands.reduce((acc, land) => acc + land.timers.length, 0)} active
              timers
            </Badge>
            <Button
              onClick={fetchData}
              variant="outline"
              size="icon"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <RegularDataTable
          session={session}
          setLands={setLands}
          filterColumn="owner"
          columns={columns}
          data={lands}
        />
      </Container>
    </div>
  );
};
