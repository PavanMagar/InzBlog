import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { PostCard } from "@/components/PostCard";
import { SEOHead } from "@/components/SEOHead";

interface PostWithCategories {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  categories: string[];
}

export default function Index() {
  const [recentPosts, setRecentPosts] = useState<PostWithCategories[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, thumbnail_url, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);

      if (posts) {
        const postsWithCats = await Promise.all(
          posts.map(async (post) => {
            const { data: pc } = await supabase
              .from("post_categories")
              .select("category_id, categories(name)")
              .eq("post_id", post.id);
            return {
              ...post,
              categories: pc?.map((p: any) => p.categories?.name).filter(Boolean) ?? [],
            };
          })
        );
        setRecentPosts(postsWithCats);
      }

      const { data: cats } = await supabase.from("categories").select("id, name, slug").order("name");
      if (cats) setCategories(cats);
    };
    fetchData();
  }, []);

  return (
    <>
      <SEOHead title="Home" description="Inkwell — A modern blogging platform for sharing ideas, stories, and knowledge." />
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="container relative z-10 px-4 py-20 sm:py-28 md:py-36">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <span className="mb-4 inline-block rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-foreground/80">
                <i className="fa-solid fa-sparkles mr-1.5"></i>MODERN BLOGGING PLATFORM
              </span>
              <h1 className="mb-6 font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                Stories worth{" "}
                <span className="gradient-text" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  reading.
                </span>
              </h1>
              <p className="mb-8 max-w-lg text-base leading-relaxed text-primary-foreground/60 sm:text-lg">
                Discover thoughtful articles on technology, design, culture, and more.
                Written with care, curated for curious minds.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/posts"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Browse Articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(230, 75%, 58% / 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, hsl(265, 70%, 62% / 0.3) 0%, transparent 50%)" }} />
        </section>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <section className="container px-4 py-14 md:py-20">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Latest Articles</h2>
                <p className="mt-2 text-sm text-muted-foreground">Fresh perspectives and ideas</p>
              </div>
              <Link to="/posts" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <PostCard key={post.id} {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="border-t border-border" style={{ background: "var(--gradient-subtle)" }}>
            <div className="container px-4 py-14">
              <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">Explore Topics</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/posts?category=${encodeURIComponent(cat.slug)}`}
                    className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-all hover:border-primary hover:text-primary hover:shadow-[var(--shadow-elevated)]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {recentPosts.length === 0 && (
          <section className="container px-4 py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-subtle)" }}>
              <i className="fa-solid fa-pen-nib text-2xl text-primary"></i>
            </div>
            <h2 className="mb-3 mt-6 font-display text-2xl font-bold text-foreground">No articles yet</h2>
            <p className="text-muted-foreground">Content is coming soon. Stay tuned!</p>
          </section>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
