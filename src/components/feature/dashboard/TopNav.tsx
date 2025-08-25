"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { LogOut, User, Home, Settings, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";

export default function TopNav() {
  const supabase = getSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
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
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              SML Tavern
            </h1>
          </Link>

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
        </div>

        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  );
}
