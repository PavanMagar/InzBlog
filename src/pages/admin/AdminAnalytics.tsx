import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Eye, FileText, FolderOpen, TrendingUp, BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface PostStat {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  status: string;
  created_at: string;
  published_at: string | null;
}

interface CategoryStat {
  name: string;
  count: number;
}

const CHART_COLORS = [
  "hsl(230, 75%, 58%)",
  "hsl(265, 70%, 62%)",
  "hsl(200, 70%, 55%)",
  "hsl(160, 60%, 48%)",
  "hsl(330, 60%, 55%)",
  "hsl(45, 80%, 55%)",
];

export default function AdminAnalytics() {
  const [posts, setPosts] = useState<PostStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const [postsRes, catsRes, pcRes] = await Promise.all([
        supabase.from("posts").select("id, title, slug, view_count, status, created_at, published_at").order("created_at", { ascending: true }),
        supabase.from("categories").select("id, name"),
        supabase.from("post_categories").select("category_id, post_id"),
      ]);

      const postsData = postsRes.data || [];
      setPosts(postsData);

      // Category stats
      const catMap = new Map<string, string>();
      (catsRes.data || []).forEach((c: any) => catMap.set(c.id, c.name));

      const catCounts: Record<string, number> = {};
      (pcRes.data || []).forEach((pc: any) => {
        const name = catMap.get(pc.category_id);
        if (name) catCounts[name] = (catCounts[name] || 0) + 1;
      });

      setCategoryStats(
        Object.entries(catCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      );

      setLoading(false);
    };
    fetchAll();
  }, []);

  // Derived stats
  const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const avgViews = publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0;

  // Top posts by views
  const topPosts = [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 10);

  // Views bar chart data
  const viewsBarData = topPosts.map((p) => ({
    name: p.title.length > 20 ? p.title.substring(0, 20) + "…" : p.title,
    views: p.view_count,
    fullTitle: p.title,
  }));

  // Posts over time (monthly)
  const monthlyData = (() => {
    const months: Record<string, { published: number; draft: number; views: number }> = {};
    posts.forEach((p) => {
      const date = new Date(p.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { published: 0, draft: 0, views: 0 };
      if (p.status === "published") months[key].published++;
      else months[key].draft++;
      months[key].views += p.view_count || 0;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        ...data,
      }));
  })();

  // Status breakdown for pie chart
  const statusData = [
    { name: "Published", value: publishedPosts.length },
    { name: "Draft", value: draftPosts.length },
  ].filter((d) => d.value > 0);

  const statCards = [
    { label: "Total Posts", value: posts.length, icon: FileText, color: "hsl(230, 75%, 58%)" },
    { label: "Published", value: publishedPosts.length, icon: TrendingUp, color: "hsl(160, 60%, 48%)" },
    { label: "Total Views", value: totalViews, icon: Eye, color: "hsl(265, 70%, 62%)" },
    { label: "Avg Views/Post", value: avgViews, icon: BarChart3, color: "hsl(200, 70%, 55%)" },
    { label: "Categories", value: categoryStats.length, icon: FolderOpen, color: "hsl(330, 60%, 55%)" },
    { label: "Drafts", value: draftPosts.length, icon: FileText, color: "hsl(45, 80%, 55%)" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your blog performance with real-time data</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="p-4 sm:p-8 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `${s.color}20` }}
                    >
                      <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-card-foreground">{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Posts by Views */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Top Posts by Views</h3>
                {viewsBarData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viewsBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 16%, 90%)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(225, 12%, 46%)" }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={130}
                          tick={{ fontSize: 11, fill: "hsl(225, 12%, 46%)" }}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-card-foreground">{d.fullTitle}</p>
                                <p className="text-muted-foreground">{d.views} views</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="views" radius={[0, 6, 6, 0]} fill="url(#barGradient)" />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="hsl(230, 75%, 58%)" />
                            <stop offset="100%" stopColor="hsl(265, 70%, 62%)" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No view data yet</p>
                )}
              </div>

              {/* Views Over Time */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Views Over Time</h3>
                {monthlyData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 16%, 90%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(225, 12%, 46%)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(225, 12%, 46%)" }} />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-card-foreground">{label}</p>
                                <p className="text-muted-foreground">{payload[0].value} views</p>
                              </div>
                            );
                          }}
                        />
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(230, 75%, 58%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(265, 70%, 62%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="views" stroke="hsl(230, 75%, 58%)" fill="url(#areaGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No data yet</p>
                )}
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Posts Growth */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Posts Growth</h3>
                {monthlyData.length > 0 ? (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 16%, 90%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(225, 12%, 46%)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(225, 12%, 46%)" }} allowDecimals={false} />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-card-foreground">{label}</p>
                                {payload.map((p: any) => (
                                  <p key={p.dataKey} style={{ color: p.color }}>{p.dataKey}: {p.value}</p>
                                ))}
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="published" stackId="a" fill="hsl(230, 75%, 58%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="draft" stackId="a" fill="hsl(265, 70%, 62%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No data yet</p>
                )}
                <div className="mt-3 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(230, 75%, 58%)" }} />
                    <span className="text-xs text-muted-foreground">Published</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(265, 70%, 62%)" }} />
                    <span className="text-xs text-muted-foreground">Draft</span>
                  </div>
                </div>
              </div>

              {/* Post Status Breakdown */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Post Status</h3>
                {statusData.length > 0 ? (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0];
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-card-foreground">{d.name}: {d.value}</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No posts yet</p>
                )}
                <div className="mt-2 flex items-center justify-center gap-4">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS[i] }} />
                      <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Category Distribution</h3>
                {categoryStats.length > 0 ? (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="name"
                        >
                          {categoryStats.map((_, index) => (
                            <Cell key={`cat-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0];
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-card-foreground">{d.name}: {d.value} posts</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No categories yet</p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                  {categoryStats.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{c.name} ({c.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Posts Table */}
            <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-display text-base font-semibold text-card-foreground">All Posts Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:px-5">#</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:px-5">Title</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:px-5">Status</th>
                      <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-muted-foreground sm:px-5">Views</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:px-5">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...posts].sort((a, b) => b.view_count - a.view_count).map((post, idx) => (
                      <tr key={post.id} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">{idx + 1}</td>
                        <td className="px-4 py-3 sm:px-5">
                          <p className="text-sm font-medium text-card-foreground">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/{post.slug}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.status === "published" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-card-foreground sm:px-5">
                          {post.view_count.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
