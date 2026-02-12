import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface RelatedPostsProps {
  currentPostId: string;
  categoryNames: string[];
}

interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  categories: string[];
}

export function RelatedPosts({ currentPostId, categoryNames }: RelatedPostsProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (categoryNames.length === 0) {
        const { data } = await supabase
          .from("posts")
          .select("id, title, slug, excerpt, thumbnail_url, published_at")
          .eq("status", "published")
          .neq("id", currentPostId)
          .order("published_at", { ascending: false })
          .limit(3);
        if (data) setPosts(data.map((p) => ({ ...p, categories: [] })));
        return;
      }

      const { data: cats } = await supabase.from("categories").select("id").in("name", categoryNames);
      if (!cats || cats.length === 0) return;

      const { data: pcData } = await supabase
        .from("post_categories")
        .select("post_id")
        .in("category_id", cats.map((c) => c.id));
      if (!pcData) return;

      const postIds = [...new Set(pcData.map((p) => p.post_id))].filter((id) => id !== currentPostId);
      if (postIds.length === 0) return;

      const shuffled = postIds.sort(() => Math.random() - 0.5).slice(0, 3);
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, thumbnail_url, published_at")
        .eq("status", "published")
        .in("id", shuffled);

      if (postsData) {
        const withCats = await Promise.all(
          postsData.map(async (post) => {
            const { data: pc } = await supabase
              .from("post_categories")
              .select("categories(name)")
              .eq("post_id", post.id);
            return {
              ...post,
              categories: pc?.map((p: any) => p.categories?.name).filter(Boolean) ?? [],
            };
          })
        );
        setPosts(withCats);
      }
    };

    fetchRelated();
  }, [currentPostId, categoryNames]);

  if (posts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <h3 className="font-display text-sm font-bold text-foreground">Related Articles</h3>
      </div>

      <div className="space-y-3">
        {posts.map((post, i) => (
          <Link
            key={post.id}
            to={`/posts/${post.slug}.html`}
            className="group flex gap-3 rounded-xl border border-border/50 bg-background p-3 transition-all duration-200 hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5"
          >
            {post.thumbnail_url ? (
              <img
                src={post.thumbnail_url}
                alt={post.title}
                className="h-16 w-20 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--gradient-subtle)" }}>
                <i className="fa-solid fa-newspaper text-sm text-muted-foreground/30"></i>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-card-foreground transition-colors group-hover:text-primary">
                {post.title}
              </h4>
              {post.categories.length > 0 && (
                <div className="mb-1 flex flex-wrap gap-1">
                  {post.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="rounded bg-primary/8 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </time>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
