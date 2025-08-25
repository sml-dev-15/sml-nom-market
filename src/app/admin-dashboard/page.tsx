"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopNav from "@/components/feature/dashboard/TopNav";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Users, BarChart3, Settings, Shield } from "lucide-react";
import { AdminUsersTable } from "@/components/feature/admin/AdminUsersTable";
import AdminLand from "@/components/feature/admin/AdminLand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logSupabaseError(label: string, error: any) {
  if (!error) {
    console.error(label, "Unknown error object:", error);
    return;
  }
  console.error(label, {
    message: error.message || "No message",
    code: error.code || "No code",
    details: error.details || "No details",
    hint: error.hint || "No hint",
  });
}

export default function AdminControlPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdminStats = useCallback(async () => {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from("profiles")
        .select("id", { count: "exact" });

      if (totalError) {
        logSupabaseError("Error fetching total profiles:", totalError);
        return;
      }

      const { count: adminCount, error: adminError } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "admin");

      if (adminError) {
        logSupabaseError("Error fetching admin profiles:", adminError);
        return;
      }

      // Get regular users count
      const { count: userCount, error: userError } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "user");

      if (userError) {
        logSupabaseError("Error fetching user profiles:", userError);
        return;
      }

      setAdminStats((prev) => ({
        ...prev,
        totalUsers: totalCount ?? 0,
        adminUsers: adminCount ?? 0,
        regularUsers: userCount ?? 0,
      }));
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  }, [supabase]);

  const checkAdminStatus = useCallback(
    async (id: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          logSupabaseError("Error fetching user role:", error);
          setErrorMessage(`Database error: ${error.message}`);
          router.push("/dashboard");
          return;
        }

        if (!data) {
          setErrorMessage("User profile not found. Please contact support.");
          router.push("/dashboard");
          return;
        }

        if (data.role !== "admin") {
          setErrorMessage("You don't have admin permissions");
          router.push("/dashboard");
          return;
        }

        setUserRole(data.role);
        await fetchAdminStats();
      } catch (err) {
        console.error("Unexpected error in checkAdminStatus:", err);
        setErrorMessage("An unexpected error occurred");
        router.push("/dashboard");
      }
    },
    [supabase, router, fetchAdminStats]
  );

  const getSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logSupabaseError("Session error:", error);
        setErrorMessage(`Authentication error: ${error.message}`);
        router.push("/login");
        return;
      }

      if (!data.session) {
        router.push("/login");
        return;
      }

      const user = data.session.user;
      setUserEmail(user.email ?? null);
      await checkAdminStatus(user.id);
    } catch (err) {
      console.error("Error in getSession:", err);
      setErrorMessage("An unexpected error occurred");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [supabase, router, checkAdminStatus]);

  useEffect(() => {
    getSession();
  }, [getSession]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setErrorMessage(
          "Connection timeout. Please check your internet connection."
        );
        setLoading(false);
      }
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [loading]);

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

  if (errorMessage) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-destructive mb-4">
              <h2 className="text-xl font-bold">Error</h2>
              <p>{errorMessage}</p>
              <p className="text-sm mt-2">
                Please check the browser console for details.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md"
            >
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/50">
      <TopNav />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userEmail}</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-2"
            >
              <Shield size={16} />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Admin Users
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.adminUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users with admin privileges
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Regular Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.regularUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard user accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.activeUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active in last 30 days
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminLand />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminUsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Permission management interface will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Admin settings will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
