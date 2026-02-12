import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, FolderOpen, Eye, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPosts: 0, totalCategories: 0, totalViews: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [postsRes, catsRes, recentRes] = await Promise.all([
        supabase.from("posts").select("id, view_count"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id, title, slug, status, created_at, view_count").order("created_at", { ascending: false }).limit(5),
      ]);

      const totalViews = postsRes.data?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      setStats({
        totalPosts: postsRes.data?.length || 0,
        totalCategories: catsRes.count || 0,
        totalViews,
      });
      setRecentPosts(recentRes.data || []);
    };
    fetch();
  }, []);

  const statCards = [
    { label: "Total Posts", value: stats.totalPosts, icon: FileText, gradient: "from-primary to-accent" },
    { label: "Categories", value: stats.totalCategories, icon: FolderOpen, gradient: "from-accent to-primary" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, gradient: "from-primary to-primary" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's an overview of your blog.</p>
        </div>

        <div className="p-4 sm:p-8">
          {/* Quick action */}
          <Link
            to="/admin/posts/new"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 p-4 text-sm font-medium text-primary transition-all hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Create a new post</span>
          </Link>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                    <s.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <p className="font-display text-3xl font-bold text-card-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Posts */}
          <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <h2 className="font-display text-base font-semibold text-card-foreground sm:text-lg">Recent Posts</h2>
              <Link to="/admin/posts" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {recentPosts.length === 0 ? (
                <p className="px-6 py-8 text-center text-muted-foreground">No posts yet. Create your first post!</p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between px-5 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <Link to={`/admin/posts/${post.id}`} className="block truncate text-sm font-medium text-card-foreground hover:text-primary">
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-3">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "published" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                      }`}>
                        {post.status}
                      </span>
                      <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                        <Eye className="h-3 w-3" /> {post.view_count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
