import { create } from "zustand";

interface Timer {
  id: string;
  endTime: number; // timestamp in milliseconds
  landId: string;
}

interface TimerStore {
  timers: Timer[];
  // Core CRUD operations
  addTimer: (timer: Timer) => void;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Omit<Timer, "id">>) => void;
  // Bulk operations
  setTimers: (timers: Timer[]) => void;
  removeTimersByLandId: (landId: string) => void;
  // Utility getters
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
