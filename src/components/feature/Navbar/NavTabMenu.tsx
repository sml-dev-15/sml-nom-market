"use client";

import { cn } from "@/lib/utils";
import {
  MAIN_NAV_TABS,
  PROFILE_NAV_TAB,
  type NavTab,
  type NavTabId,
} from "./nav-tabs";

type NavTabMenuProps = {
  activeTab: NavTabId;
  onTabChange: (tabId: NavTabId) => void;
};

function NavTabButton({
  tab,
  isActive,
  onSelect,
  className,
}: {
  tab: NavTab;
  isActive: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-medium transition-colors",
        "text-muted-foreground hover:text-foreground",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
      <span className="hidden sm:inline">{tab.shortLabel}</span>
    </button>
  );
}

export function NavTabMenu({ activeTab, onTabChange }: NavTabMenuProps) {
  return (
    <div
      role="tablist"
      aria-label="Main navigation"
      className="inline-flex items-center gap-0.5 rounded-full border border-border/50 bg-muted/80 p-1 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center gap-0.5">
        {MAIN_NAV_TABS.map((tab) => (
          <NavTabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onSelect={() => onTabChange(tab.id)}
          />
        ))}
      </div>

      <div className="mx-0.5 h-5 w-px bg-border/80 hidden sm:block" aria-hidden />

      <div className="rounded-full bg-background/40 p-0.5">
        <NavTabButton
          tab={PROFILE_NAV_TAB}
          isActive={activeTab === PROFILE_NAV_TAB.id}
          onSelect={() => onTabChange(PROFILE_NAV_TAB.id)}
          className={cn(
            activeTab === PROFILE_NAV_TAB.id &&
              "bg-muted text-foreground shadow-sm"
          )}
        />
      </div>
    </div>
  );
}
