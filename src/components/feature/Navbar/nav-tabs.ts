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
      "Browse live Nomstead market listings, compare unit prices, and spot the best deals for items you want to buy or sell.",
    highlights: [
      "Real-time to-buy and to-sell listings",
      "Sortable table with filters and columns",
      "Best deals finder for quick wins",
    ],
  },
  {
    ...MAIN_NAV_TABS[1],
    title: "Crafting Calculator",
    description:
      "Estimate the full material cost of buildings and recipes before you commit resources on your farm.",
    highlights: [
      "Building and recipe cost breakdowns",
      "Uses current market prices where relevant",
      "Plan upgrades without guesswork",
    ],
  },
  {
    ...MAIN_NAV_TABS[2],
    title: "Energy Calculator",
    description:
      "Analyze energy costs against item prices so you can decide what is worth crafting, selling, or buying.",
    highlights: [
      "Energy vs price comparisons",
      "Supports smarter crafting choices",
      "Built for Nomstead economy planning",
    ],
  },
  {
    ...PROFILE_NAV_TAB,
    title: "Owner Profile",
    description:
      "Look up any marketplace owner and view their active listings in one place.",
    highlights: [
      "Search by owner ID",
      "See all listings from that player",
      "Handy for trading and price checks",
    ],
  },
];
