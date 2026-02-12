import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SEOHead } from "@/components/SEOHead";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError("Invalid credentials. Please try again.");
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <>
      <SEOHead title="Admin Login" />
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-full max-w-sm rounded-2xl border border-border/10 bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
              <i className="fa-solid fa-feather-pointed text-xl text-white"></i>
            </div>
            <h1 className="font-display text-2xl font-bold text-card-foreground">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your blog</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
