import { useEffect, useState, useCallback } from "react";
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

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    setVisibleCount(INITIAL_COUNT);
  };

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("posts")
      .select("id, title, slug, excerpt, thumbnail_url, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (query) {
      q = q.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
    }

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
        ? postsWithCats.filter((p: any) => p._categoryIds.includes(filterCategoryId))
        : postsWithCats;

      setAllPosts(filtered);
    }
    setLoading(false);
  }, [query, categorySlug, categories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const visiblePosts = allPosts.slice(0, visibleCount);
  const hasMore = visibleCount < allPosts.length;
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <>
      <SEOHead title="Articles" description="Browse coding tutorials, programming guides, and tech articles. Search, filter by category, and discover developer resources." />
      <PublicHeader />

      <main className="container px-6 py-8 md:px-10 md:py-12 lg:px-16">
        {/* Hero Header */}
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8 md:p-10">
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-subtle)" }} />
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <i className="fa-solid fa-newspaper text-[10px] text-primary"></i>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">All Articles</span>
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">Articles & Tutorials</h1>
            <p className="max-w-lg text-sm text-muted-foreground">Discover coding tutorials, programming guides, and tech resources for developers</p>
          </div>
        </div>

        {/* Search + Categories Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => updateParam("q", e.target.value)}
                placeholder="Search articles..."
                className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-10 text-sm shadow-[var(--shadow-card)] outline-none transition-all focus:shadow-[var(--shadow-elevated)] focus:ring-2 focus:ring-ring"
              />
              {query && (
                <button onClick={() => updateParam("q", "")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all ${
                showFilters || categorySlug ? "border-primary/30 bg-primary/5 text-primary shadow-[var(--shadow-card)]" : "border-input bg-card text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {categorySlug && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span>}
            </button>
          </div>

          {/* Category Chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam("category", "")}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                        !categorySlug
                          ? "text-primary-foreground shadow-sm"
                          : "border border-border bg-background text-foreground hover:bg-muted"
                      }`}
                      style={!categorySlug ? { background: "var(--gradient-primary)" } : undefined}
                    >
                      All
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => updateParam("category", c.slug === categorySlug ? "" : c.slug)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                          c.slug === categorySlug
                            ? "text-primary-foreground shadow-sm"
                            : "border border-border bg-background text-foreground hover:bg-muted"
                        }`}
                        style={c.slug === categorySlug ? { background: "var(--gradient-primary)" } : undefined}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter badges */}
          {(activeCategory || query) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Active filters:</span>
              {query && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                  <Search className="h-3 w-3" />
                  "{query}"
                  <button onClick={() => updateParam("q", "")} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"><X className="h-3 w-3" /></button>
                </span>
              )}
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 font-medium text-accent">
                  {activeCategory.name}
                  <button onClick={() => updateParam("category", "")} className="ml-0.5 rounded-full p-0.5 hover:bg-accent/20"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : visiblePosts.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <PostCard {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load More ({allPosts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <i className="fa-solid fa-magnifying-glass mb-4 text-4xl text-muted-foreground/30"></i>
            <p className="text-lg font-medium text-foreground">No articles found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
