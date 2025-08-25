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
import { User, BarChart3, Store, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/50">
      <TopNav />

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                Welcome back, {userEmail?.split("@")[0] || "Farmer"}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ready to grow your farm today
              </p>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid grid-cols-2 gap-4 w-full max-w-md bg-background/50 backdrop-blur-sm border border-border/20">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                Farm Analytics
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Store className="w-4 h-4" />
                Marketplace
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="dashboard" className="m-0">
                <Card className="border-border/50 backdrop-blur-sm bg-background/80">
                  <CardContent className="p-6">
                    <DashboardDataTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market" className="m-0">
                <Card className="border-border/50 backdrop-blur-sm bg-background/80">
                  <CardContent className="p-6">
                    <Hero />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
