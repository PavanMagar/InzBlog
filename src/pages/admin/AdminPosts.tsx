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
        <div className="flex items-center justify-between border-b border-border bg-card px-8 py-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Posts</h1>
            <p className="text-sm text-muted-foreground">Manage your blog posts</p>
          </div>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </div>

        <div className="p-8">
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
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Title</th>
                    <th className="hidden px-6 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Status</th>
                    <th className="hidden px-6 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Views</th>
                    <th className="hidden px-6 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Date</th>
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
                      <td className="hidden px-6 py-4 md:table-cell">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">{post.view_count}</td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/posts/${post.slug}.html`} target="_blank" className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <Link to={`/admin/posts/${post.id}`} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button onClick={() => deletePost(post.id, post.title)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
