import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import {
  login,
  setAuthToken,
  setAuthUser,
  resetOwnerPassword,
} from "@/app/lib/api";
import { useTheme } from "@/app/contexts/ThemeContext";

const API_BASE_URL = "http://localhost:4000";

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Recovery form state
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/setup/store`);
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.name || "Pharmacy Management");
        }
      } catch (error) {
        console.error("Failed to fetch store name:", error);
      }
    };
    fetchStoreName();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setIsLoading(true);

    try {
      const auth = await login({ username: username.trim(), password });
      setAuthToken(auth.token);

      const user: User = {
        id: auth.user.id,
        name: auth.user.name,
        username: auth.user.username,
        role: auth.user.role,
        status: auth.user.isActive ? "active" : "disabled",
      };

      setAuthUser(auth.user);
      toast.success(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        onLogin(user);
      }, 300);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid username or password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !recoveryUsername ||
      !recoveryCode ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (recoveryCode.length !== 6) {
      toast.error("Recovery code must be 6 digits");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await resetOwnerPassword({
        username: recoveryUsername.trim(),
        recoveryCode: recoveryCode.trim(),
        newPassword,
      });
      toast.success("Password reset successfully! You can now log in.");
      setShowForgotPassword(false);
      setRecoveryUsername("");
      setRecoveryCode("");
      setNewPassword("");
      setConfirmPassword("");
      setUsername(recoveryUsername.trim());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please check your recovery code.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-lg bg-card border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-[var(--text-primary)]" />
        ) : (
          <Moon className="w-5 h-5 text-[var(--text-primary)]" />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-[var(--border)] rounded-lg p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">
              {storeName || "Pharmacy Management"}
            </h1>
          </div>

          {!showForgotPassword ? (
            <>
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your username"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isLoading}
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
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Forgot Password Link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="mt-6 p-4 bg-[var(--muted)] rounded-md border border-[var(--border)]">
                <p className="text-xs text-[var(--text-secondary)]">
                  Use the owner account you created during setup.
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {/* Password Recovery Form */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Enter your username and the recovery code you saved during
                  setup.
                </p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="recoveryUsername">Username</Label>
                  <Input
                    id="recoveryUsername"
                    value={recoveryUsername}
                    onChange={(e) => setRecoveryUsername(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your username"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="recoveryCode">Recovery Code</Label>
                  <Input
                    id="recoveryCode"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="mt-1 font-mono text-lg tracking-wider"
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Enter the 6-digit code shown during setup
                  </p>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 8 characters)"
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              <Button
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setRecoveryUsername("");
                  setRecoveryCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="w-full mt-4"
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-[var(--text-tertiary)]">
            {storeName ? `${storeName} v1.0.0` : "v1.0.0"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
