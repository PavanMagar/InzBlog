import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <PublicHeader />
        <div className="container px-4 py-20 text-center">
          <i className="fa-solid fa-file-circle-question mb-4 text-5xl text-muted-foreground/30"></i>
          <h1 className="mb-3 font-display text-3xl font-bold text-foreground">Article Not Found</h1>
          <p className="mb-6 text-muted-foreground">The article you're looking for doesn't exist.</p>
          <Link to="/posts" className="text-primary hover:underline">← Back to articles</Link>
        </div>
        <PublicFooter />
      </>
    );
  }

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

      {/* Hero image */}
      {post.thumbnail_url && (
        <div className="relative h-56 overflow-hidden sm:h-72 md:h-96">
          <img src={post.thumbnail_url} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        </div>
      )}

      <div className="container px-6 py-8 md:px-12 md:py-12 lg:px-20 xl:px-28">
        {/* Desktop: 2-column layout */}
        <div className="lg:flex lg:gap-10 xl:gap-14">
          {/* Left: Article content */}
          <article className="min-w-0 flex-1 lg:max-w-3xl">
            <Link to="/posts" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to articles
            </Link>

            {post.categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <span key={cat} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mb-4 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.published_at && (
              <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{post.view_count} views</span>
                </div>
              </div>
            )}

            <div className="prose-content text-foreground" dangerouslySetInnerHTML={{ __html: post.content || "" }} />

            {/* Share (visible on mobile, hidden on desktop) */}
            <div className="mt-8 lg:hidden">
              <SharePost title={post.title} slug={post.slug} />
            </div>

            {/* Comment section for mobile */}
            <div className="mt-8 lg:hidden">
              <CommentSection postId={post.id} />
            </div>

            {/* Related posts for mobile */}
            <div className="mt-8 lg:hidden">
              <RelatedPosts currentPostId={post.id} categoryNames={post.categories} />
            </div>
          </article>

          {/* Right sidebar: desktop only */}
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
