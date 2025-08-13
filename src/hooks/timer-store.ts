import { create } from "zustand";

interface Timer {
  id: string;
  endTime: number;
  landId: string;
}

interface TimerStore {
  timers: Timer[];
  addTimer: (timer: Timer) => void;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Omit<Timer, "id">>) => void;
  setTimers: (timers: Timer[]) => void;
  removeTimersByLandId: (landId: string) => void;
  getTimersByLandId: (landId: string) => Timer[];
  getTimerById: (id: string) => Timer | undefined;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timers: [],

  addTimer: (timer) =>
    set((state) => ({
      timers: [...state.timers, timer],
    })),

  removeTimer: (id) =>
    set((state) => ({
      timers: state.timers.filter((t) => t.id !== id),
    })),

  updateTimer: (id, updates) =>
    set((state) => ({
      timers: state.timers.map((timer) =>
        timer.id === id ? { ...timer, ...updates } : timer
      ),
    })),

  setTimers: (timers) => set({ timers }),

  removeTimersByLandId: (landId) =>
    set((state) => ({
      timers: state.timers.filter((t) => t.landId !== landId),
    })),

  getTimersByLandId: (landId) => {
    return get().timers.filter((t) => t.landId === landId);
  },

  getTimerById: (id) => {
    return get().timers.find((t) => t.id === id);
  },
}));
