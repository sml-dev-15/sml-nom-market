"use client";

import Link from "next/link";
import { NavTabMenu } from "./NavTabMenu";
import { MobileNavMenu } from "./MobileNavMenu";
import type { NavTabId } from "./nav-tabs";

type NavbarProps = {
  activeTab?: NavTabId | null;
  onTabChange?: (tabId: NavTabId) => void;
  onGoHome?: () => void;
};

export const Navbar = ({ activeTab, onTabChange, onGoHome }: NavbarProps) => {
  const showTabs = onTabChange !== undefined;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {onGoHome ? (
          <button
            type="button"
            onClick={onGoHome}
            className="z-10 flex shrink-0 items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-90 sm:text-xl"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            SML Tavern
          </button>
        ) : (
          <Link
            href="/"
            className="z-10 flex shrink-0 items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-90 sm:text-xl"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            SML Tavern
          </Link>
        )}

        {showTabs && (
          <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <NavTabMenu
              activeTab={activeTab ?? null}
              onTabChange={onTabChange}
            />
          </div>
        )}

        <div className="z-10 ml-auto flex shrink-0 items-center gap-1">
          {showTabs && onGoHome && (
            <div className="md:hidden">
              <MobileNavMenu
                activeTab={activeTab ?? null}
                onTabChange={onTabChange}
                onGoHome={onGoHome}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
