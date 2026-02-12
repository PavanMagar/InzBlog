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
        <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Posts</h1>
            <p className="text-sm text-muted-foreground">Manage your blog posts</p>
          </div>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </div>

        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <i className="fa-solid fa-file-lines mb-4 text-4xl text-muted-foreground/30"></i>
              <p className="mb-4 text-muted-foreground">No posts yet.</p>
              <Link to="/admin/posts/new" className="text-primary hover:underline">Create your first post →</Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
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
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.status === "published" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
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
                            <Link to={`/admin/posts/${post.id}/detail`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="View Detail">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link to={`/posts/${post.slug}.html`} target="_blank" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="View Live">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <Link to={`/admin/posts/${post.id}/edit`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button onClick={() => deletePost(post.id, post.title)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
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
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "published" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" /> {post.view_count} views</span>
                      <div className="flex gap-1">
                        <Link to={`/admin/posts/${post.id}/detail`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" /></Link>
                        <Link to={`/posts/${post.slug}.html`} target="_blank" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><ExternalLink className="h-4 w-4" /></Link>
                        <Link to={`/admin/posts/${post.id}/edit`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></Link>
                        <button onClick={() => deletePost(post.id, post.title)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
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
