import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email update requested. Check your new email for confirmation.");
      setNewEmail("");
    }
    setSavingEmail(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and website settings</p>
        </div>

        <div className="mx-auto max-w-2xl p-4 sm:p-8">
          {/* Account Info */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Account Information</h2>
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Current Email</p>
              <p className="text-sm font-medium text-card-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Update Email */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Update Email</h2>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="newemail@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={savingEmail}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {savingEmail ? "Updating..." : "Update Email"}
              </button>
            </form>
          </div>

          {/* Update Password */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-card-foreground">Update Password</h2>
              <button onClick={() => setShowPasswords(!showPasswords)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">Confirm New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
