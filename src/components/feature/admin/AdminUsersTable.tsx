"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Mail, Shield, Edit, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
}

export function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Failed to fetch user profiles");
        return;
      }

      setUsers(
        data?.map((profile) => ({
          id: profile.id,
          email: profile.email || "No email",
          role: profile.role || "user",
          status: profile.status || "active",
          created_at: profile.created_at,
          last_sign_in_at: profile.last_sign_in_at,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user role:", error);
        toast.error("Failed to update user role");
        return;
      }

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setUpdatingUserId(userId);
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user status:", error);
        toast.error("Failed to update user status");
        return;
      }

      toast.success("User status updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: { label: "Admin", class: "bg-red-100 text-red-800" },
      moderator: { label: "Moderator", class: "bg-blue-100 text-blue-800" },
      user: { label: "User", class: "bg-gray-100 text-gray-800" },
    };

    return (
      <Badge
        variant="outline"
        className={variants[role as keyof typeof variants]?.class}
      >
        {variants[role as keyof typeof variants]?.label || role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status === "active" ? "Active" : "Inactive"}
    </Badge>
  );

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">All Users</h3>
          <Button size="sm" disabled>
            Add User
          </Button>
        </div>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">All Users ({users.length})</h3>
        <Button size="sm">Add User</Button>
      </div>
      <div className="divide-y">
        {users.map((user) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Joined {formatDate(user.created_at)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={updatingUserId === user.id}
                  >
                    {updatingUserId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="w-4 h-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Shield className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, "admin")}
                      >
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, "moderator")}
                      >
                        Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, "user")}
                      >
                        User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Change Status
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => updateUserStatus(user.id, "active")}
                      >
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserStatus(user.id, "inactive")}
                      >
                        Inactive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
