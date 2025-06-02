import { create } from "zustand";

type UseDarkModeBgState = {
  isDarkModeBg: boolean;
};

type UseDarkModeBgActions = {
  setDarkModeBg: (isDarkModeBg: boolean) => void;
};

const initialState: UseDarkModeBgState = {
  isDarkModeBg: false,
};

export const useDarkModeBgStore = create<
  UseDarkModeBgState & UseDarkModeBgActions
>()((set) => ({
  ...initialState,
  setDarkModeBg: (isDarkModeBg) => set({ isDarkModeBg }),
}));
