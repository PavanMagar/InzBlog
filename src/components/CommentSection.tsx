import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Heart, Reply, Send, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_admin_reply: boolean;
  likes_count: number;
  created_at: string;
  replies?: Comment[];
}

function getVisitorId(): string {
  let id = localStorage.getItem("inkwell_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("inkwell_visitor_id", id);
  }
  return id;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentForm({ postId, parentId, onSuccess, onCancel, placeholder }: {
  postId: string;
  parentId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [name, setName] = useState(() => localStorage.getItem("inkwell_comment_name") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("inkwell_comment_email") || "");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    localStorage.setItem("inkwell_comment_name", name.trim());
    localStorage.setItem("inkwell_comment_email", email.trim());

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      parent_id: parentId || null,
      author_name: name.trim(),
      author_email: email.trim(),
      content: content.trim(),
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to post comment");
    } else {
      setContent("");
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
      onSuccess();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder="Your name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
        <Input
          placeholder="Your email *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
        />
      </div>
      <Textarea
        placeholder={placeholder || "Write your comment..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={2000}
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting} size="sm" className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </motion.form>
  );
}

function SingleComment({ comment, postId, onRefresh, depth = 0 }: {
  comment: Comment;
  postId: string;
  onRefresh: () => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [liked, setLiked] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes_count);
  const visitorId = getVisitorId();

  useEffect(() => {
    supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", comment.id)
      .eq("visitor_id", visitorId)
      .then(({ data }) => {
        if (data && data.length > 0) setLiked(true);
      });
  }, [comment.id, visitorId]);

  const handleLike = async () => {
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 600);

    if (liked) {
      setLiked(false);
      setLocalLikes((p) => Math.max(0, p - 1));
      await supabase.from("comment_likes").delete().eq("comment_id", comment.id).eq("visitor_id", visitorId);
      await supabase.from("comments").update({ likes_count: Math.max(0, localLikes - 1) }).eq("id", comment.id);
    } else {
      setLiked(true);
      setLocalLikes((p) => p + 1);
      await supabase.from("comment_likes").insert({ comment_id: comment.id, visitor_id: visitorId });
      await supabase.from("comments").update({ likes_count: localLikes + 1 }).eq("id", comment.id);
    }
  };

  const replies = comment.replies || [];
  const maxDepth = 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? "ml-4 border-l-2 border-border pl-4 sm:ml-6 sm:pl-5" : ""}`}
    >
      <div className="group rounded-xl p-3 transition-colors hover:bg-muted/30">
        <div className="mb-1.5 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
            style={{ background: comment.is_admin_reply ? "var(--gradient-primary)" : `hsl(${(comment.author_name.charCodeAt(0) * 47) % 360}, 55%, 55%)` }}
          >
            {comment.is_admin_reply ? "A" : comment.author_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{comment.author_name}</span>
              {comment.is_admin_reply && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Admin</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
          </div>
        </div>

        <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{comment.content}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          >
            <motion.div animate={animateLike ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500" : ""}`} />
            </motion.div>
            {localLikes > 0 && <span>{localLikes}</span>}
          </button>

          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          )}

          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {showReplies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReplyForm && (
          <div className="ml-4 mt-2 sm:ml-6">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={() => {
                setShowReplyForm(false);
                onRefresh();
              }}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.author_name}...`}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 space-y-1">
            {replies.map((reply) => (
              <SingleComment
                key={reply.id}
                comment={reply}
                postId={postId}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      const map = new Map<string, Comment>();
      const roots: Comment[] = [];

      data.forEach((c: any) => map.set(c.id, { ...c, replies: [] }));
      data.forEach((c: any) => {
        const comment = map.get(c.id)!;
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(comment);
        } else {
          roots.push(comment);
        }
      });

      setComments(roots);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, () => {
        fetchComments();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comment_likes" }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchComments]);

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);
  const visibleComments = showAll ? comments : comments.slice(-2);
  const hasMore = comments.length > 2 && !showAll;

  return (
    <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Comments {totalComments > 0 && `(${totalComments})`}
            </h2>
          </div>
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            className="gap-1.5"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-3.5 w-3.5" />
            {showForm ? "Close" : "Add Comment"}
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4 rounded-xl border border-border bg-muted/20 p-4">
                <CommentForm postId={postId} onSuccess={() => { fetchComments(); setShowForm(false); }} onCancel={() => setShowForm(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-1">
            {hasMore && (
              <button
                onClick={() => setShowAll(true)}
                className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Load {comments.length - 2} more comment{comments.length - 2 > 1 ? "s" : ""}
              </button>
            )}
            {visibleComments.map((comment) => (
              <SingleComment key={comment.id} comment={comment} postId={postId} onRefresh={fetchComments} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
        )}
    </div>
  );
}
