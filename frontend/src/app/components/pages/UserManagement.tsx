import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Plus, UserX, UserCheck, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import {
  getUsers,
  createUser,
  toggleUserStatus,
  resetUserPassword,
} from "@/app/lib/api";

interface UserManagementProps {
  currentUser: User;
}

interface StaffUser {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function UserManagement({
  currentUser: _currentUser,
}: UserManagementProps) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [resetPassword, setResetPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setStaff(data.filter((u) => u.role === "STAFF"));
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateAddForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (formData.username.length < 4)
      newErrors.username = "Username must be at least 4 characters";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors: Record<string, string> = {};
    if (!resetPassword.newPassword)
      newErrors.newPassword = "Password is required";
    if (resetPassword.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStaff = async () => {
    if (!validateAddForm()) return;

    try {
      setSubmitting(true);
      await createUser({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: "STAFF",
      });
      toast.success("Staff member added successfully");
      setShowAddDialog(false);
      setFormData({
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user: StaffUser) => {
    try {
      await toggleUserStatus(user.id);
      toast.success(
        `User ${user.isActive ? "disabled" : "enabled"} successfully`,
      );
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const openResetDialog = (user: StaffUser) => {
    setSelectedUser(user);
    setResetPassword({ newPassword: "", confirmPassword: "" });
    setErrors({});
    setShowResetDialog(true);
  };

  const handleResetPassword = async () => {
    if (!validateResetForm() || !selectedUser) return;
    try {
      setSubmitting(true);
      await resetUserPassword(selectedUser.id, {
        newPassword: resetPassword.newPassword,
      });
      toast.success(`Password reset for ${selectedUser.name}`);
      setShowResetDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2">User Management</h1>
          <p className="text-[var(--text-secondary)]">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="bg-card border border-[var(--border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Loading staff...
              </p>
            </div>
          </div>
        ) : staff.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[var(--text-secondary)]">
              No staff members found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Username
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Created At
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                      index === staff.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                          user.isActive
                            ? "bg-[var(--success-light)] text-[var(--success)]"
                            : "bg-[var(--error-light)] text-[var(--error)]"
                        }`}
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(user)}
                          title={user.isActive ? "Disable user" : "Enable user"}
                        >
                          {user.isActive ? (
                            <UserX className="w-4 h-4 text-[var(--error)]" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-[var(--success)]" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openResetDialog(user)}
                          title="Reset password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Choose a username"
                className="mt-1"
              />
              {errors.username && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.username}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStaff}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Staff"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Reset password for{" "}
            <span className="font-semibold">{selectedUser?.name}</span>
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showResetPassword ? "text" : "password"}
                  value={resetPassword.newPassword}
                  onChange={(e) =>
                    setResetPassword({
                      ...resetPassword,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showResetPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmNewPassword"
                  type={showResetConfirmPassword ? "text" : "password"}
                  value={resetPassword.confirmPassword}
                  onChange={(e) =>
                    setResetPassword({
                      ...resetPassword,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowResetConfirmPassword(!showResetConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showResetConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
