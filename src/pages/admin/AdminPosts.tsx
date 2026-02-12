import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { toast } from "sonner";

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) toast.error("Failed to delete post");
    else {
      toast.success("Post deleted");
      fetchPosts();
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="flex flex-col gap-3 border-b border-border bg-card px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Posts</h1>
            <p className="text-sm text-muted-foreground">Manage your blog posts</p>
          </div>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </div>

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-4 text-muted-foreground">No posts yet.</p>
              <Link to="/admin/posts/new" className="text-primary hover:underline">Create your first post →</Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-card-foreground">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/{post.slug}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            post.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{post.view_count}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/posts/${post.slug}.html`} target="_blank" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <Link to={`/admin/posts/${post.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button onClick={() => deletePost(post.id, post.title)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {posts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-card-foreground truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">/{post.slug}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.view_count}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link to={`/posts/${post.slug}.html`} target="_blank" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link to={`/admin/posts/${post.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => deletePost(post.id, post.title)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
