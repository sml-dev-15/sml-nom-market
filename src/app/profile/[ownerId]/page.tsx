"use client";

import { useParams } from "next/navigation";
import { OwnerProfileView } from "@/components/feature/OwnerProfile";
import { Navbar } from "@/components/feature/Navbar";
import { Footer } from "@/components/feature/Footer";

export default function ProfilePage() {
  const params = useParams();
  const ownerId = params?.ownerId as string;

  if (!ownerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid owner ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="flex-none sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border/50 shadow-sm">
        <Navbar />
      </header>
      <main className="flex-grow">
        <OwnerProfileView key={ownerId} ownerId={ownerId} />
      </main>
      <footer className="flex-none border-t border-border/30 bg-muted/30">
        <Footer />
      </footer>
    </div>
  );
}
