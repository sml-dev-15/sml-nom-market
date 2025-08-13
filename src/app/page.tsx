"use client";

import { Footer } from "@/components/feature/Footer";
import { Hero } from "@/components/feature/Hero";
import { useDarkModeBgStore } from "@/hooks/use-dark-mode-bg";
import Image from "next/image";
import { Navbar } from "@/components/feature/Navbar";

export default function Home() {
  const { isDarkModeBg } = useDarkModeBgStore();
  return (
    <div className="relative min-h-screen w-full">
      <Image
        src={!isDarkModeBg ? "/assets/tarven.png" : "/assets/tarven-light.png"}
        alt="Nomstead Background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 z-10 " />

      <div className="relative z-20">
        <Navbar />
        <Hero />
        <Footer />
      </div>
    </div>
  );
}
