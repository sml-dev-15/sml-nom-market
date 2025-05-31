"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted)
    return (
      <Button variant="outline" size="icon">
        <Loader className="h-[1.2rem] w-[1.2rem] animate-spin" />
      </Button>
    );

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    >
      <Sun
        className={`transition-transform duration-300 h-[1.2rem] w-[1.2rem] ${
          theme === "dark" ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`transition-transform duration-300 h-[1.2rem] w-[1.2rem] ${
          theme === "dark"
            ? "rotate-0 scale-100"
            : "-rotate-90 scale-0 absolute"
        }`}
      />
    </Button>
  );
};
