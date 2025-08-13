"use client";

import { useEffect, useState } from "react";
import { createColumns } from "./Column";
import { RegularDataTable } from "../DataTable";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabaseClient";
import { Land } from "@/types/land";
import { useTimerRefresherStore } from "@/hooks/use-timer-store";
import { useTimerStore } from "@/hooks/timer-store";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";

export const DashboardDataTable = () => {
  const session = useSession();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshCount = useTimerRefresherStore((state) => state.refreshCount);
  const { setTimers, removeTimersByLandId, removeTimer } = useTimerStore();

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setLoading(true);

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

        setLands(transformedLands);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, refreshCount, setTimers]);

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
    } catch (err) {
      console.error("Delete error:", err instanceof Error ? err.message : err);

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

      toast.success("Success", {
        description: "Timer deleted successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete timer",
      });
      console.error("Error deleting timer:", error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading lands...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!session)
    return <div className="p-4">Please sign in to view your lands</div>;

  const columns = createColumns(handleDelete, handleDeleteTimer);

  return (
    <div className="w-full min-h-screen">
      <Container className="relative z-20 text-gray-900 dark:text-gray-100">
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
