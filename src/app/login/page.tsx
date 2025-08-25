"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn } from "lucide-react";

export default function Auth() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === "signup" && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(authError.message);
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess("Check your email for verification link.");
          setMode("login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-muted/50">
      <div className="w-full max-w-md">
        <Card className="w-full border-border/50 shadow-xl backdrop-blur-sm bg-background/80">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {mode === "login" ? (
                  <LogIn className="w-6 h-6 text-primary" />
                ) : (
                  <UserPlus className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Welcome back" : "Join us"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue your journey"
                : "Create your account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || success) && (
              <div
                className={cn(
                  "p-3 rounded-lg text-sm border",
                  error
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {error || success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-4 py-6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-12 py-6"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-12 py-6"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-6 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
            {/* 
            <div className="text-center">
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                  setSuccess(null);
                }}
                disabled={isLoading}
              >
                {mode === "login"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
