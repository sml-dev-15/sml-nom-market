"use client";

import PublicLandsTable from "@/components/feature/admin/PublicLandTable";
import { Footer } from "@/components/feature/Footer";
import { Hero } from "@/components/feature/Hero";
import { Navbar } from "@/components/feature/Navbar";
import { TaskCalculator } from "@/components/feature/TaskCalculator";
// import CraftingCostComparison from "@/components/feature/TaskCostCalculator";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Calculator } from "lucide-react"; // Added Calculator icon
import { useState } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("hero");

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-background via-background/95 to-muted/50">
      <header className="flex-none sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
        <Navbar />
      </header>

      <main
        id="main-content"
        className="flex-grow relative overflow-hidden md:p-5"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/.08),transparent)]" />

        <div className="container mx-auto max-w-7xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="hero">Market</TabsTrigger>
              <TabsTrigger value="lands">Public Lands</TabsTrigger>
              <TabsTrigger value="calculator">Calculator</TabsTrigger>{" "}
            </TabsList>

            <TabsContent value="hero">
              <Hero />
            </TabsContent>

            <TabsContent value="lands">
              <div className="w-full rounded-2xl py-8">
                <Container className="relative z-20">
                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Map className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight text-accent-foreground">
                        Land Directory
                      </h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                      Explore a comprehensive list of public lands, including
                      their names, links, and associated industries.
                    </p>
                  </div>
                  <PublicLandsTable />
                </Container>
              </div>
            </TabsContent>

            {/* New Task Cost Calculator Tab */}
            <TabsContent value="calculator">
              <div className="w-full rounded-2xl py-8">
                <Container className="relative z-20">
                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Calculator className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight text-accent-foreground">
                        Task Cost Calculator
                      </h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                      Calculate the estimated costs for various tasks.
                    </p>
                  </div>

                  {/* Add your calculator component here */}
                  <div className="rounded-2xl border border-border">
                    {/* <CraftingCostComparison /> */}
                    <TaskCalculator />
                  </div>
                </Container>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="flex-none border-t border-border/20 bg-background/95 backdrop-blur-sm">
        <Footer />
      </footer>
    </div>
  );
}
