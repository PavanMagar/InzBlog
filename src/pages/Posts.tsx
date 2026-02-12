import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
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

const POSTS_PER_PAGE = 9;

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostWithCategories[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1");

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
      let q = supabase
        .from("posts")
        .select("id, title, slug, excerpt, thumbnail_url, published_at", { count: "exact" })
        .eq("status", "published");

      if (query) {
        q = q.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
      }

      q = q.order("published_at", { ascending: sort === "oldest" });
      q = q.range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

      const { data: postsData, count } = await q;
      setTotal(count || 0);

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

        setPosts(filtered);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [query, categorySlug, sort, page, categories]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  return (
    <>
      <SEOHead title="Articles" description="Browse all articles on Inkwell. Search, filter by category, and discover great content." />
      <PublicHeader />

      <main className="container py-8 md:py-10">
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground md:mb-8 md:text-4xl">Articles</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Search articles..."
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring focus:shadow-[var(--shadow-glow)]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categorySlug}
              onChange={(e) => updateParam("category", e.target.value)}
              className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:flex-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParam("page", String(p))}
                    className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? "text-primary-foreground shadow-[var(--shadow-glow)]"
                        : "border border-border bg-card text-foreground hover:bg-muted"
                    }`}
                    style={p === page ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No articles found.</p>
          </div>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
