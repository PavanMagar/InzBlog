import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { MessageCircle, Search, Send, Reply, Trash2, Eye, ChevronUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CommentData {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_admin_reply: boolean;
  likes_count: number;
  created_at: string;
  post_title?: string;
  replies?: CommentData[];
}

export default function AdminComments() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [posts, setPosts] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPost, setFilterPost] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fullViewComment, setFullViewComment] = useState<CommentData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [commentsRes, postsRes] = await Promise.all([
      supabase.from("comments").select("*").order("created_at", { ascending: true }),
      supabase.from("posts").select("id, title"),
    ]);

    const postsData = postsRes.data || [];
    setPosts(postsData);

    const postMap = new Map(postsData.map((p) => [p.id, p.title]));
    const allComments = (commentsRes.data || []).map((c: any) => ({
      ...c,
      post_title: postMap.get(c.post_id) || "Unknown Post",
      replies: [] as CommentData[],
    }));

    // Build tree
    const map = new Map<string, CommentData>();
    const roots: CommentData[] = [];
    allComments.forEach((c) => map.set(c.id, { ...c, replies: [] }));
    allComments.forEach((c) => {
      const comment = map.get(c.id)!;
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.replies!.push(comment);
      } else {
        roots.push(comment);
      }
    });

    setComments(roots.reverse());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("admin-comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleReply = async (commentId: string, postId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      parent_id: commentId,
      author_name: "Admin",
      author_email: "admin@inkwell.blog",
      content: replyContent.trim(),
      is_admin_reply: true,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to post reply");
    } else {
      toast.success("Reply posted!");
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment and all its replies?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else toast.success("Comment deleted");
  };

  const allFlat = flattenComments(comments);

  const filtered = allFlat.filter((c) => {
    if (search) {
      const s = search.toLowerCase();
      if (!c.author_name.toLowerCase().includes(s) && !c.author_email.toLowerCase().includes(s) && !c.content.toLowerCase().includes(s) && !(c.post_title || "").toLowerCase().includes(s))
        return false;
    }
    if (filterPost !== "all" && c.post_id !== filterPost) return false;
    if (filterType === "comments" && c.parent_id) return false;
    if (filterType === "replies" && !c.parent_id) return false;
    if (filterType === "admin" && !c.is_admin_reply) return false;
    return true;
  });

  // Only show root-level when no search/filter active — show threaded
  const showThreaded = !search && filterPost === "all" && filterType === "all";

  const totalAll = allFlat.length;
  const totalComments = allFlat.filter((c) => !c.parent_id && !c.is_admin_reply).length;
  const totalReplies = allFlat.filter((c) => c.parent_id).length;
  const totalLikes = allFlat.reduce((sum, c) => sum + c.likes_count, 0);

  const statCards = [
    { label: "Total", value: totalAll, color: "hsl(217, 91%, 60%)" },
    { label: "Comments", value: totalComments, color: "hsl(271, 81%, 56%)" },
    { label: "Replies", value: totalReplies, color: "hsl(160, 60%, 48%)" },
    { label: "Likes", value: totalLikes, color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Comments</h1>
          <p className="text-sm text-muted-foreground">Manage and reply to reader comments</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="p-4 sm:p-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search comments, users, posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <select value={filterPost} onChange={(e) => setFilterPost(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="all">All Posts</option>
                {posts.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="all">All Types</option>
                <option value="comments">Comments Only</option>
                <option value="replies">Replies Only</option>
                <option value="admin">Admin Replies</option>
              </select>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {showThreaded ? (
                comments.length === 0 ? (
                  <EmptyState />
                ) : (
                  comments.map((comment) => (
                    <AdminCommentThread
                      key={comment.id}
                      comment={comment}
                      onReply={(id) => { setReplyingTo(replyingTo === id ? null : id); setReplyContent(""); }}
                      onDelete={handleDelete}
                      onFullView={setFullViewComment}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      submitting={submitting}
                      handleReply={handleReply}
                      setReplyingTo={setReplyingTo}
                      depth={0}
                    />
                  ))
                )
              ) : (
                filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  filtered.map((comment) => (
                    <AdminCommentCard
                      key={comment.id}
                      comment={comment}
                      onReply={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(""); }}
                      onDelete={() => handleDelete(comment.id)}
                      onFullView={() => setFullViewComment(comment)}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      submitting={submitting}
                      handleReply={() => handleReply(comment.id, comment.post_id)}
                      setReplyingTo={setReplyingTo}
                    />
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* Full View Modal */}
        <AnimatePresence>
          {fullViewComment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
              onClick={() => setFullViewComment(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: fullViewComment.is_admin_reply ? "var(--gradient-primary)" : `hsl(${(fullViewComment.author_name.charCodeAt(0) * 47) % 360}, 55%, 55%)` }}
                    >
                      {fullViewComment.is_admin_reply ? "A" : fullViewComment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{fullViewComment.author_name}</p>
                      <p className="text-xs text-muted-foreground">{fullViewComment.author_email}</p>
                    </div>
                  </div>
                  <button onClick={() => setFullViewComment(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  On: <span className="font-medium text-foreground">{fullViewComment.post_title}</span>
                  <span className="ml-2">• {new Date(fullViewComment.created_at).toLocaleString()}</span>
                  {fullViewComment.likes_count > 0 && <span className="ml-2 text-red-500">♥ {fullViewComment.likes_count}</span>}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{fullViewComment.content}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function flattenComments(comments: CommentData[]): CommentData[] {
  const result: CommentData[] = [];
  const recurse = (list: CommentData[]) => {
    list.forEach((c) => {
      result.push(c);
      if (c.replies?.length) recurse(c.replies);
    });
  };
  recurse(comments);
  return result;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">No comments found</p>
    </div>
  );
}

function AdminCommentThread({
  comment, onReply, onDelete, onFullView, replyingTo, replyContent, setReplyContent, submitting, handleReply, setReplyingTo, depth
}: {
  comment: CommentData;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onFullView: (c: CommentData) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (v: string) => void;
  submitting: boolean;
  handleReply: (commentId: string, postId: string) => void;
  setReplyingTo: (v: string | null) => void;
  depth: number;
}) {
  return (
    <div className={depth > 0 ? "ml-4 border-l-2 border-border pl-4 sm:ml-6 sm:pl-5" : ""}>
      <AdminCommentCard
        comment={comment}
        onReply={() => onReply(comment.id)}
        onDelete={() => onDelete(comment.id)}
        onFullView={() => onFullView(comment)}
        replyingTo={replyingTo}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        submitting={submitting}
        handleReply={() => handleReply(comment.id, comment.post_id)}
        setReplyingTo={setReplyingTo}
      />
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <AdminCommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              onFullView={onFullView}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              submitting={submitting}
              handleReply={handleReply}
              setReplyingTo={setReplyingTo}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminCommentCard({
  comment, onReply, onDelete, onFullView, replyingTo, replyContent, setReplyContent, submitting, handleReply, setReplyingTo
}: {
  comment: CommentData;
  onReply: () => void;
  onDelete: () => void;
  onFullView: () => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (v: string) => void;
  submitting: boolean;
  handleReply: () => void;
  setReplyingTo: (v: string | null) => void;
}) {
  const isLong = comment.content.length > 200;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: comment.is_admin_reply ? "var(--gradient-primary)" : `hsl(${(comment.author_name.charCodeAt(0) * 47) % 360}, 55%, 55%)` }}
        >
          {comment.is_admin_reply ? "A" : comment.author_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{comment.author_name}</span>
            {comment.is_admin_reply && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Admin</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{comment.author_email}</span>
            <span>•</span>
            <span>{new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            {comment.likes_count > 0 && (<><span>•</span><span className="text-red-500">♥ {comment.likes_count}</span></>)}
          </div>
          {comment.post_title && (
            <div className="mt-1 rounded-lg bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              On: <span className="font-medium text-foreground">{comment.post_title}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="whitespace-pre-wrap text-sm text-foreground/90">
          {isLong ? comment.content.substring(0, 200) + "..." : comment.content}
        </p>
        {isLong && (
          <button onClick={onFullView} className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
            <Eye className="h-3 w-3" /> View full comment
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!comment.is_admin_reply && (
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onReply}>
            <Reply className="h-3 w-3" /> Reply
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      </div>

      <AnimatePresence>
        {replyingTo === comment.id && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
              <Textarea placeholder={`Reply to ${comment.author_name}...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} rows={2} maxLength={2000} />
              <div className="flex gap-2">
                <Button size="sm" className="gap-1" disabled={submitting || !replyContent.trim()} onClick={handleReply}>
                  <Send className="h-3 w-3" /> {submitting ? "Sending..." : "Send Reply"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyContent(""); }}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
