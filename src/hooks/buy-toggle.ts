import { create } from "zustand";

type MarketType = "toBuy" | "toSell";

interface MarketStore {
  marketType: MarketType;
  setMarketType: (type: MarketType) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  marketType: "toBuy",
  setMarketType: (type) => set({ marketType: type }),
}));
