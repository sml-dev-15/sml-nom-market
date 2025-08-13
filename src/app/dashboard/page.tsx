"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TopNav from "@/components/feature/dashboard/TopNav";
import { DashboardDataTable } from "@/components/feature/dashboard/DashboardDataTable";
import Image from "next/image";
import { useDarkModeBgStore } from "@/hooks/use-dark-mode-bg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hero } from "@/components/feature/Hero";
import { Container } from "@/components/ui/container";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const supabase = getSupabaseClient();
  const { isDarkModeBg } = useDarkModeBgStore();
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
      <div className="relative min-h-screen w-full">
        <Image
          src={
            !isDarkModeBg ? "/assets/tarven.png" : "/assets/tarven-light.png"
          }
          alt="Nomstead Background"
          fill
          className="object-cover object-center z-0"
          priority
        />
        <div className="absolute inset-0 z-10" />
        <div className="relative z-20 flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <Image
        src={!isDarkModeBg ? "/assets/tarven.png" : "/assets/tarven-light.png"}
        alt="Nomstead Background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 z-10" />

      <div className="relative z-20">
        <TopNav />
        <div className="px-6 py-8 dark:text-white">
          <h2 className="text-base lg:text-2xl font-semibold">
            Welcome, {userEmail || "Farmer"}
          </h2>
          <p className="text-xs lg:text-base text-muted-foreground">
            Here’s your latest farm overview.
          </p>

          <Tabs defaultValue="dashboard">
            <Container className="relative z-20 mt-2 text-gray-900 dark:text-gray-100">
              <TabsList className="grid grid-cols-2 gap-2 w-full">
                <TabsTrigger value="dashboard">Land</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>
            </Container>
            <TabsContent value="dashboard">
              <DashboardDataTable />
            </TabsContent>
            <TabsContent value="market">
              <Hero />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
