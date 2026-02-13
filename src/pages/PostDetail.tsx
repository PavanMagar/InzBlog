import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Eye, BookOpen, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import { CommentSection } from "@/components/CommentSection";
import { SharePost } from "@/components/SharePost";
import { RelatedPosts } from "@/components/RelatedPosts";

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
  categories: string[];
}

function estimateReadTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, "");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function wordCount(html: string | null): number {
  if (!html) return 0;
  return html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanSlug = slug?.replace(/\.html$/, "") || "";

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", cleanSlug)
        .eq("status", "published")
        .single();

      if (data) {
        supabase.from("posts").update({ view_count: data.view_count + 1 }).eq("id", data.id).then();

        const { data: pc } = await supabase
          .from("post_categories")
          .select("categories(name)")
          .eq("post_id", data.id);

        setPost({
          ...data,
          categories: pc?.map((p: any) => p.categories?.name).filter(Boolean) ?? [],
        });
      }
      setLoading(false);
    };
    if (cleanSlug) fetchPost();
  }, [cleanSlug]);

  if (loading) {
    return (
      <>
        <PublicHeader />
        <div className="flex min-h-[60vh] items-center justify-center pt-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <PublicHeader />
        <div className="container px-4 py-20 pt-36 text-center">
          <i className="fa-solid fa-file-circle-question mb-4 text-5xl text-muted-foreground/30"></i>
          <h1 className="mb-3 font-display text-3xl font-bold text-foreground">Article Not Found</h1>
          <p className="mb-6 text-muted-foreground">The article you're looking for doesn't exist.</p>
          <Link to="/posts" className="text-primary hover:underline">← Back to articles</Link>
        </div>
        <PublicFooter />
      </>
    );
  }

  const words = wordCount(post.content);

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || undefined}
        ogImage={post.thumbnail_url || undefined}
        type="article"
        publishedAt={post.published_at || undefined}
      />
      <PublicHeader />

      {/* ── Immersive Article Header ── */}
      <div className="relative overflow-hidden pt-16 md:pt-20" style={{ background: "var(--gradient-hero)" }}>
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.4), transparent 70%)" }} />
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(271 81% 56% / 0.4), transparent 70%)" }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-10 sm:px-8 md:pb-14">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/posts" className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-white/70 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> All Articles
            </Link>
          </motion.div>

          {/* Categories */}
          {post.categories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white/90" style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.3), hsl(271 81% 56% / 0.3))", border: "1px solid hsl(217 91% 60% / 0.2)" }}>
                  <Sparkles className="h-3 w-3" />
                  {cat}
                </span>
              ))}
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-6 max-w-4xl font-display text-2xl font-extrabold leading-[1.15] text-white sm:text-3xl md:text-4xl lg:text-5xl"
          >
            {post.title}
          </motion.h1>

          {/* Metadata row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 text-sm text-white/60"
          >
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/40" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                </time>
              </div>
            )}
            <span className="hidden text-white/20 sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-white/40" />
              <span>{post.view_count.toLocaleString()} views</span>
            </div>
            <span className="hidden text-white/20 sm:inline">•</span>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-white/40" />
              <span>{words.toLocaleString()} words</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-10">
        <div className="lg:flex lg:gap-10 xl:gap-14">
          {/* Left: Article */}
          <article className="min-w-0 flex-1 overflow-hidden lg:max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="prose-content max-w-none text-foreground [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:max-w-full [&_table]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />

            {/* Mobile-only sections */}
            <div className="mt-10 space-y-6 lg:hidden">
              <SharePost title={post.title} slug={post.slug} />
              <CommentSection postId={post.id} />
              <RelatedPosts currentPostId={post.id} categoryNames={post.categories} />
            </div>
          </article>

          {/* Right sidebar: desktop */}
          <aside className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-6">
              <SharePost title={post.title} slug={post.slug} />
              <CommentSection postId={post.id} />
              <RelatedPosts currentPostId={post.id} categoryNames={post.categories} />
            </div>
          </aside>
        </div>
      </div>

      <PublicFooter />
    </>
  );
}
