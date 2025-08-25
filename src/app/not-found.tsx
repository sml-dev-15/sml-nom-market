"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/50 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <Card className="w-full max-w-md border-border/40 bg-background/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 text-center">
          {/* 404 Number Display */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-primary/20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-foreground">404</div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            Oops! The page you&apos;re looking for seems to have wandered off
            into the digital wilderness. Let&apos;s get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-primary"
              asChild
            >
              <Link href="/search">
                <Search className="h-4 w-4" />
                Try searching instead
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Decorative elements */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
          <span>Lost but not forgotten</span>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
