"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Settings, Menu, Moon, Sun } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";

export const Navbar = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = getSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUserEmail(session?.user?.email || null);
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserEmail(null);
    router.push("/login");
  };

  const navItems = isLoggedIn
    ? [
        {
          icon: Home,
          label: "Dashboard",
          href: "/dashboard",
          onClick: () => router.push("/dashboard"),
        },
        {
          icon: User,
          label: "Profile",
          href: "/profile",
          onClick: () => router.push("/profile"),
        },
        {
          icon: Settings,
          label: "Settings",
          href: "/settings",
          onClick: () => router.push("/settings"),
        },
      ]
    : [];

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              SML Tavern
            </h1>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-bold text-foreground flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            SML Tavern
          </Link>

          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  className="text-foreground/80 hover:text-foreground"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground/80 hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {isLoggedIn && userEmail && (
            <span className="text-sm text-foreground/70 hidden lg:block">
              {userEmail}
            </span>
          )}

          {isLoggedIn && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-foreground/80 hover:text-foreground"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left">Navigation</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className="w-full justify-start text-foreground/80 hover:text-foreground"
                        onClick={item.onClick}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    ))}

                    {/* Theme Toggle in Mobile Menu */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-foreground/80 hover:text-foreground"
                      onClick={toggleTheme}
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4 mr-3" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-3" />
                          Dark Mode
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 mt-4"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
