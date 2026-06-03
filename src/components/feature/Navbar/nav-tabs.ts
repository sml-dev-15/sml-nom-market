import { Hammer, Store, User, Zap, type LucideIcon } from "lucide-react";

export type NavTabId = "hero" | "craft" | "calculator" | "profile";

export type NavTab = {
  id: NavTabId;
  shortLabel: string;
  icon: LucideIcon;
};

export type FeatureInfo = NavTab & {
  title: string;
  description: string;
  highlights: string[];
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

export const FEATURES: FeatureInfo[] = [
  {
    ...MAIN_NAV_TABS[0],
    title: "Marketplace",
    description:
      "Browse live Nomstead listings — For Sale items you can purchase and Wants to Buy orders where you can sell.",
    highlights: [
      "For Sale and Wants to Buy tabs with live counts",
      "Sortable table with filters and column controls",
      "Best Deals finder for lowest prices",
    ],
  },
  {
    ...MAIN_NAV_TABS[1],
    title: "Crafting Calculator",
    description:
      "Compare buy-all vs craft-from-raw costs using real stock availability before you commit resources.",
    highlights: [
      "Buy vs craft rankings with savings bars",
      "Expandable material breakdowns per item",
      "Filters by station, savings, and price",
    ],
  },
  {
    ...MAIN_NAV_TABS[2],
    title: "Energy Calculator",
    description:
      "Rank energy items by gold efficiency so you know what food and goods give the best energy per coin.",
    highlights: [
      "Efficiency rankings with progress bars",
      "Summary cards for best deals and averages",
      "Filter by tier, energy, price, and seller",
    ],
  },
  {
    ...PROFILE_NAV_TAB,
    title: "Owner Profile",
    description:
      "Search any marketplace owner and view their For Sale and Wants to Buy listings in one place.",
    highlights: [
      "Search by owner name with popular trader shortcuts",
      "Sortable listings with grouped tile view",
      "Jump here from any seller name in the market table",
    ],
  },
];
