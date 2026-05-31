"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { NavTabMenu } from "./NavTabMenu";
import type { NavTabId } from "./nav-tabs";

type NavbarProps = {
  activeTab?: NavTabId | null;
  onTabChange?: (tabId: NavTabId) => void;
  onGoHome?: () => void;
};

export const Navbar = ({ activeTab, onTabChange, onGoHome }: NavbarProps) => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const showTabs = onTabChange !== undefined;

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <h1 className="flex shrink-0 items-center gap-2 text-lg font-bold text-foreground sm:text-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            SML Tavern
          </h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-auto min-h-14 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:px-6">
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
          <div className="flex w-full justify-center sm:absolute sm:left-1/2 sm:w-auto sm:-translate-x-1/2">
            <NavTabMenu
              activeTab={activeTab ?? null}
              onTabChange={onTabChange}
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="z-10 ml-auto shrink-0 text-foreground/80 hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </nav>
  );
};
