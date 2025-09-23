"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TopNav from "@/components/feature/dashboard/TopNav";
import { DashboardDataTable } from "@/components/feature/dashboard/DashboardDataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hero } from "@/components/feature/Hero";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { User, BarChart3, Store, Sparkles, Users } from "lucide-react";
import { GuildMarketplace } from "@/components/feature/GuildMarket";

// Loading component for better UX
function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/50">
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md border-border/50 backdrop-blur-sm bg-background/80">
          <CardContent className="space-y-6 p-8">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-10 w-24 mx-auto rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setUserEmail(data.session.user.email ?? null);
      }
      setLoading(false);
    };
    getSession();
  }, [router, supabase.auth]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/50">
      <TopNav />

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Welcome back, {userEmail?.split("@")[0] || "Farmer"}!
                </h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ready to grow your farm today
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 gap-2 w-full max-w-2xl bg-background/50 backdrop-blur-sm border border-border/20 p-1 rounded-lg">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Farm Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Global Market</span>
                <span className="sm:hidden">Market</span>
              </TabsTrigger>
              <TabsTrigger
                value="guild-market"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Guild Market</span>
                <span className="sm:hidden">Guild</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="m-0 space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-background/80 shadow-lg">
                  <CardContent className="p-6">
                    <DashboardDataTable />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Global Market Tab */}
              <TabsContent value="market" className="m-0">
                <Card className="border-border/50 backdrop-blur-sm bg-background/80 shadow-lg">
                  <CardContent className="p-0 ">
                    <Hero />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Guild Marketplace Tab */}
              <TabsContent value="guild-market" className="m-0">
                <Card className="border-border/50 backdrop-blur-sm bg-background/80 shadow-lg">
                  <CardContent className="p-0">
                    <GuildMarketplace />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          {/* Bottom Status Bar */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Market Data Live</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>3 Guild Members Online</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
