import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTimerStore } from "@/hooks/timer-store";
import { ChevronDown, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { TimerDisplay } from "./CountdownTimer";

export const TimerCell = ({
  timers,
  onDeleteTimer,
}: {
  timers: { id: string }[];
  onDeleteTimer: (id: string) => void;
}) => {
  const getTimerById = useTimerStore((state) => state.getTimerById);

  const sortedTimers = useMemo(() => {
    return [...timers].sort((a, b) => {
      const timerA = getTimerById(a.id);
      const timerB = getTimerById(b.id);
      return (timerA?.endTime || 0) - (timerB?.endTime || 0);
    });
  }, [timers, getTimerById]);

  const nextTimer = useMemo(() => {
    const now = Date.now();
    return (
      sortedTimers.find((t) => {
        const timer = getTimerById(t.id);
        return timer && timer.endTime > now; // only future timers
      }) || null
    );
  }, [sortedTimers, getTimerById]);

  if (timers.length === 0) {
    return <span className="text-gray-500 text-xs">No timers</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <div className="flex items-center gap-2">
            {nextTimer ? (
              <TimerDisplay timerId={nextTimer.id} />
            ) : (
              <span className="text-green-600 text-xs">Ready</span>
            )}

            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>
          {timers.length} active timer{timers.length > 1 ? "s" : ""}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortedTimers.map((timer) => (
          <DropdownMenuItem
            key={timer.id}
            className="flex justify-between"
            onSelect={(e) => e.preventDefault()}
          >
            <TimerDisplay timerId={timer.id} />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTimer(timer.id);
              }}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
