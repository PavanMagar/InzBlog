import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Eye, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import { CommentSection } from "@/components/CommentSection";
import { SharePost } from "@/components/SharePost";
import { RelatedPosts } from "@/components/RelatedPosts";
import { PostDetailSkeleton } from "@/components/skeletons/PostDetailSkeleton";
import {
  LinkShortenerProvider,
  LinkShortenerTop,
  LinkShortenerBottom,
} from "@/components/LinkShortenerOverlay";

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
  view_count: number;
  categories: string[];
  comments_enabled: boolean;
}

function estimateReadTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, "");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
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
    return <PostDetailSkeleton />;
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

  const postDate = post.published_at || post.created_at;

  return (
    <LinkShortenerProvider>
      <SEOHead
        title={post.title}
        description={post.excerpt || undefined}
        ogImage={post.thumbnail_url || undefined}
        type="article"
        publishedAt={post.published_at || undefined}
      />
      <PublicHeader />

      <div className="pt-20 md:pt-28">
        <LinkShortenerTop />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center py-10 md:py-16"
          >
            <Link
              to="/posts"
              className="group mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              All articles
            </Link>

            {post.categories.length > 0 && (
              <div className="mb-5 flex flex-wrap justify-center gap-2">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-block rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mb-6 max-w-3xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mb-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-5 py-2 text-sm text-muted-foreground">
              <time dateTime={postDate}>
                {new Date(postDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.view_count.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-10">
        <div className="lg:flex lg:gap-10 xl:gap-14">
          <article className="min-w-0 flex-1 overflow-hidden lg:max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="prose-content max-w-none text-foreground [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:max-w-full [&_table]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />
            <div className="mt-10 space-y-6 lg:hidden">
              <SharePost title={post.title} slug={post.slug} />
              <CommentSection postId={post.id} commentsEnabled={post.comments_enabled} />
              <RelatedPosts currentPostId={post.id} categoryNames={post.categories} />
            </div>
          </article>
          <aside className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-6">
              <SharePost title={post.title} slug={post.slug} />
              <CommentSection postId={post.id} commentsEnabled={post.comments_enabled} />
              <RelatedPosts currentPostId={post.id} categoryNames={post.categories} />
            </div>
          </aside>
        </div>
      </div>

      <LinkShortenerBottom />
      <PublicFooter />
    </LinkShortenerProvider>
  );
}
