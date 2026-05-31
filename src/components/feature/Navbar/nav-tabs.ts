import { Hammer, Store, User, Zap, type LucideIcon } from "lucide-react";

export type NavTabId = "hero" | "craft" | "calculator" | "profile";

export type NavTab = {
  id: NavTabId;
  shortLabel: string;
  icon: LucideIcon;
};

export const MAIN_NAV_TABS: NavTab[] = [
  { id: "hero", shortLabel: "Market", icon: Store },
  { id: "craft", shortLabel: "Craft", icon: Hammer },
  { id: "calculator", shortLabel: "Energy", icon: Zap },
];

export const PROFILE_NAV_TAB: NavTab = {
  id: "profile",
  shortLabel: "Profile",
  icon: User,
};

export const ALL_NAV_TAB_IDS: NavTabId[] = [
  ...MAIN_NAV_TABS.map((t) => t.id),
  PROFILE_NAV_TAB.id,
];
