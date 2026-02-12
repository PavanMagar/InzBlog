import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  _categoryIds?: string[];
}

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 3;

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPosts, setAllPosts] = useState<PostWithCategories[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name, slug").order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setVisibleCount(INITIAL_COUNT);

      let q = supabase
        .from("posts")
        .select("id, title, slug, excerpt, thumbnail_url, published_at")
        .eq("status", "published");

      if (query) {
        q = q.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
      }

      q = q.order("published_at", { ascending: sort === "oldest" });

      const { data: postsData } = await q;

      if (postsData) {
        let filterCategoryId: string | null = null;
        if (categorySlug) {
          const cat = categories.find((c) => c.slug === categorySlug);
          filterCategoryId = cat?.id || null;
        }

        const postsWithCats = await Promise.all(
          postsData.map(async (post) => {
            const { data: pc } = await supabase
              .from("post_categories")
              .select("category_id, categories(name)")
              .eq("post_id", post.id);
            return {
              ...post,
              categories: pc?.map((p: any) => p.categories?.name).filter(Boolean) ?? [],
              _categoryIds: pc?.map((p: any) => p.category_id) ?? [],
            };
          })
        );

        const filtered = filterCategoryId
          ? postsWithCats.filter((p) => p._categoryIds?.includes(filterCategoryId!))
          : postsWithCats;

        setAllPosts(filtered);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [query, categorySlug, sort, categories]);

  const visiblePosts = allPosts.slice(0, visibleCount);
  const hasMore = visibleCount < allPosts.length;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = !!query || !!categorySlug || sort !== "latest";

  return (
    <>
      <SEOHead title="Articles — Inkwell" description="Browse coding tutorials, programming guides, and tech articles. Search, filter by category, and discover great developer content." />
      <PublicHeader />

      <main>
        {/* Hero header */}
        <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle, hsl(217, 91%, 60%) 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }} />
          <div className="container relative z-10 px-4 py-12 md:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl text-center">
              <h1 className="mb-3 font-display text-3xl font-bold text-primary-foreground sm:text-4xl md:text-5xl">Articles</h1>
              <p className="mb-8 text-sm text-primary-foreground/50 sm:text-base">Explore our collection of tutorials, guides, and tech insights</p>

              {/* Search bar */}
              <div className="relative mx-auto max-w-lg">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => updateParam("q", e.target.value)}
                  placeholder="Search articles, tutorials, guides..."
                  className="h-12 w-full rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 pl-11 pr-4 text-sm text-primary-foreground placeholder:text-primary-foreground/30 outline-none backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters bar */}
        <div className="sticky top-16 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
          <div className="container flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${showFilters ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>

            {/* Quick category pills */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => updateParam("category", "")}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${!categorySlug ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary/40"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam("category", c.slug)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${categorySlug === c.slug ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="container flex items-center gap-4 px-4 py-3">
                  <label className="text-xs text-muted-foreground">Sort by:</label>
                  <select
                    value={sort}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="latest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <span className="text-xs text-muted-foreground">{allPosts.length} article{allPosts.length !== 1 ? "s" : ""} found</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Posts Grid */}
        <div className="container px-4 py-8 md:py-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : visiblePosts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post) => (
                  <PostCard key={post.id} {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load More ({allPosts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <i className="fa-solid fa-magnifying-glass mb-4 text-4xl text-muted-foreground/30" />
              <p className="mb-2 text-lg font-semibold text-foreground">No articles found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">Clear all filters</button>
              )}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
