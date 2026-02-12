import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Calendar, MessageCircle, Heart, Pencil, Trash2, ExternalLink, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  thumbnail_url: string | null;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface CommentData {
  id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_admin_reply: boolean;
  likes_count: number;
  created_at: string;
  parent_id: string | null;
}

export default function AdminPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const [postRes, commentsRes, catRes] = await Promise.all([
        supabase.from("posts").select("*").eq("id", id).single(),
        supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: false }),
        supabase.from("post_categories").select("categories(name)").eq("post_id", id),
      ]);

      if (postRes.data) setPost(postRes.data);
      setComments(commentsRes.data || []);
      setCategories(catRes.data?.map((p: any) => p.categories?.name).filter(Boolean) ?? []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!post || !confirm(`Delete "${post.title}"?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Post deleted");
      navigate("/admin/posts");
    }
  };

  const totalComments = comments.filter((c) => !c.parent_id).length;
  const totalReplies = comments.filter((c) => c.parent_id).length;
  const totalLikes = comments.reduce((sum, c) => sum + c.likes_count, 0);
  const wordCount = post?.content ? post.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <Link to="/admin/posts" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to posts
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Post Detail</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !post ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Post not found.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-8 space-y-6">
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden"
            >
              {post.thumbnail_url && (
                <div className="h-48 sm:h-56">
                  <img src={post.thumbnail_url} alt={post.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    post.status === "published" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}>
                    {post.status}
                  </span>
                  {categories.map((cat) => (
                    <span key={cat} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{cat}</span>
                  ))}
                </div>
                <h2 className="mb-2 font-display text-xl font-bold text-foreground sm:text-2xl">{post.title}</h2>
                {post.excerpt && (
                  <p className="mb-4 text-sm text-muted-foreground">{post.excerpt}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/posts/${post.id}/edit`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Link to={`/posts/${post.slug}.html`} target="_blank">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" /> View Live
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {[
                { label: "Views", value: post.view_count, icon: Eye, color: "hsl(217, 91%, 60%)" },
                { label: "Comments", value: totalComments, icon: MessageCircle, color: "hsl(271, 81%, 56%)" },
                { label: "Replies", value: totalReplies, icon: MessageCircle, color: "hsl(200, 70%, 50%)" },
                { label: "Likes", value: totalLikes, icon: Heart, color: "hsl(0, 72%, 51%)" },
                { label: "Words", value: wordCount, icon: FileText, color: "hsl(160, 60%, 48%)" },
                { label: "Read Time", value: `${readTime}m`, icon: Clock, color: "hsl(40, 80%, 55%)" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="font-display text-xl font-bold text-card-foreground">{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Post Meta */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-3 font-display text-sm font-bold text-foreground">Post Information</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: "Slug", value: `/${post.slug}` },
                  { label: "Created", value: new Date(post.created_at).toLocaleString() },
                  { label: "Updated", value: new Date(post.updated_at).toLocaleString() },
                  { label: "Published", value: post.published_at ? new Date(post.published_at).toLocaleString() : "Not published" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/30 px-4 py-3">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Comments */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Recent Comments ({comments.length})
                </h3>
                <Link to={`/admin/comments`} className="text-xs text-primary hover:underline">View all →</Link>
              </div>
              {comments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {comments.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-start gap-3 rounded-xl bg-muted/20 p-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: c.is_admin_reply ? "var(--gradient-primary)" : `hsl(${(c.author_name.charCodeAt(0) * 47) % 360}, 55%, 55%)` }}
                      >
                        {c.is_admin_reply ? "A" : c.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{c.author_name}</span>
                          {c.is_admin_reply && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Admin</span>}
                          {c.parent_id && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">Reply</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                        <p className="mt-1 text-sm text-foreground/90 line-clamp-2">{c.content}</p>
                        {c.likes_count > 0 && <span className="mt-1 inline-block text-xs text-red-500">♥ {c.likes_count}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
