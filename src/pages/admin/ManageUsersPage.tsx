import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { SearchBar } from "@/components/ui/search-bar";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Shield,
  TrendingUp,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getSystemStats,
} from "@/lib/adminApi";
import { UserDialog, UserFormData } from "@/components/dialogs/UserDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

export default function ManageUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getSystemStats(),
      ]);
      setUsers(usersData);
      setStats({
        totalUsers: statsData.totalUsers,
        activeUsers: statsData.activeListings, // Using active listings as proxy for active users for now
        newThisMonth: 0, // Not implemented in backend yet
        admins: usersData.filter((u: any) => u.role === "admin").length,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: UserFormData) => {
    try {
      setActionLoading(true);
      await createUser(data);
      toast({
        title: "User created",
        description: "New user has been successfully created.",
      });
      setIsUserDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser?._id) return;
    try {
      setActionLoading(true);
      await updateUser(selectedUser._id, data);
      toast({
        title: "User updated",
        description: "User information has been updated.",
      });
      setIsUserDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setActionLoading(true);
      await deleteUser(userToDelete);
      toast({
        title: "User deleted",
        description: "User has been permanently removed.",
      });
      setIsConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      toast({
        title: "Role updated",
        description: `User role changed to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setUserDialogMode("create");
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const openEditDialog = (user: any) => {
    setUserDialogMode("edit");
    setSelectedUser({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.profile?.name,
      phone: user.profile?.phone,
      location: user.profile?.location,
    });
    setIsUserDialogOpen(true);
  };

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setIsConfirmOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Manage Users"
        subtitle="View and manage all platform users"
        action={
          <Button onClick={openCreateDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={TrendingUp}
        />
        <StatsCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={UserPlus}
        />
        <StatsCard title="Administrators" value={stats.admins} icon={Shield} />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="w-64">
              <SearchBar
                placeholder="Search users..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold uppercase">
                      {user.profile?.name
                        ? user.profile.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                        : user.email.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {user.profile?.name || "No Name"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground hidden md:block">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user._id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(user._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        onSubmit={
          userDialogMode === "create" ? handleCreateUser : handleUpdateUser
        }
        user={selectedUser}
        mode={userDialogMode}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteUser}
        variant="destructive"
        confirmText={actionLoading ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
