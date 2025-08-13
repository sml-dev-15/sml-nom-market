import { create } from "zustand";

interface TimerStore {
  refreshCount: number;
  triggerRefresh: () => void;
}

export const useTimerRefresherStore = create<TimerStore>((set) => ({
  refreshCount: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshCount: state.refreshCount + 1 })),
}));
