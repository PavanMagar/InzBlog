import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, Share2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import { CommentSection } from "@/components/CommentSection";
import { PostCard } from "@/components/PostCard";
import { toast } from "sonner";

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

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  categories: string[];
}

function ShareSection({ post }: { post: PostData }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const text = `${post.title} — ${url}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${post.title}\n${url}`);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { icon: "fa-brands fa-whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}`, color: "hover:text-green-500" },
    { icon: "fa-brands fa-telegram", label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, color: "hover:text-blue-400" },
    { icon: "fa-brands fa-x-twitter", label: "X", href: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, color: "hover:text-foreground" },
    { icon: "fa-solid fa-envelope", label: "Email", href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(text)}`, color: "hover:text-primary" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Share this article</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${s.label}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-primary/40 hover:-translate-y-0.5 ${s.color}`}
          >
            <i className={`${s.icon} text-sm`} />
          </a>
        ))}
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-primary/40 hover:-translate-y-0.5 hover:text-primary"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
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
          .select("categories(name), category_id")
          .eq("post_id", data.id);

        const cats = pc?.map((p: any) => p.categories?.name).filter(Boolean) ?? [];
        const catIds = pc?.map((p: any) => p.category_id).filter(Boolean) ?? [];

        setPost({ ...data, categories: cats });

        // Fetch related posts by same categories
        if (catIds.length > 0) {
          const { data: relatedPc } = await supabase
            .from("post_categories")
            .select("post_id")
            .in("category_id", catIds)
            .neq("post_id", data.id);

          const relatedIds = [...new Set(relatedPc?.map((r: any) => r.post_id) ?? [])];

          if (relatedIds.length > 0) {
            const { data: rPosts } = await supabase
              .from("posts")
              .select("id, title, slug, excerpt, thumbnail_url, published_at")
              .eq("status", "published")
              .in("id", relatedIds.slice(0, 6));

            if (rPosts) {
              // Shuffle and pick 3
              const shuffled = rPosts.sort(() => Math.random() - 0.5).slice(0, 3);
              const withCats = await Promise.all(
                shuffled.map(async (p) => {
                  const { data: pCats } = await supabase
                    .from("post_categories")
                    .select("categories(name)")
                    .eq("post_id", p.id);
                  return { ...p, categories: pCats?.map((c: any) => c.categories?.name).filter(Boolean) ?? [] };
                })
              );
              setRelatedPosts(withCats);
            }
          }
        }
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
          <i className="fa-solid fa-file-circle-question mb-4 text-5xl text-muted-foreground/30" />
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

      <article>
        {post.thumbnail_url && (
          <div className="relative h-56 overflow-hidden sm:h-72 md:h-96">
            <img src={post.thumbnail_url} alt={post.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          </div>
        )}

        {/* Desktop: two-column layout; Mobile: stacked */}
        <div className="container px-4 py-8 md:py-12">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-10">
            {/* Left: Article Content */}
            <div className="min-w-0">
              <Link to="/posts" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to articles
              </Link>

              {post.categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/posts?category=${encodeURIComponent(cat)}`}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {cat}
                    </Link>
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

              {/* Share (visible on mobile below content) */}
              <div className="mt-8 lg:hidden">
                <ShareSection post={post} />
              </div>
            </div>

            {/* Right sidebar: Share + Comments + Related (desktop) */}
            <aside className="mt-10 space-y-6 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
              {/* Share - desktop only (mobile is inline above) */}
              <div className="hidden lg:block">
                <ShareSection post={post} />
              </div>

              {/* Comment section */}
              <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
                <CommentSection postId={post.id} />
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp.id}
                        to={`/posts/${rp.slug}.html`}
                        className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/30"
                      >
                        {rp.thumbnail_url ? (
                          <img src={rp.thumbnail_url} alt={rp.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--gradient-subtle)" }}>
                            <i className="fa-solid fa-newspaper text-xs text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-sm font-medium leading-tight text-foreground group-hover:text-primary">{rp.title}</h4>
                          {rp.categories.length > 0 && (
                            <span className="mt-1 inline-block text-[10px] text-muted-foreground">{rp.categories[0]}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>

      {/* Related Posts - full width section for mobile (below comments) */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border lg:hidden">
          <div className="container px-4 py-10">
            <h2 className="mb-6 font-display text-xl font-bold text-foreground">Related Articles</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {relatedPosts.map((rp) => (
                <PostCard key={rp.id} {...rp} publishedAt={rp.published_at} thumbnailUrl={rp.thumbnail_url} />
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
    </>
  );
}
