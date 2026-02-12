import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";

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
        // fallback: random recent posts
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

      // Get category IDs for current post's categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id")
        .in("name", categoryNames);

      if (!cats || cats.length === 0) return;

      const catIds = cats.map((c) => c.id);

      // Get post IDs sharing these categories
      const { data: pcData } = await supabase
        .from("post_categories")
        .select("post_id")
        .in("category_id", catIds);

      if (!pcData) return;

      const postIds = [...new Set(pcData.map((p) => p.post_id))].filter((id) => id !== currentPostId);
      if (postIds.length === 0) return;

      // Shuffle & pick 3
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
    <div>
      <h3 className="mb-4 font-display text-lg font-bold text-foreground">Related Articles</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} compact />
        ))}
      </div>
    </div>
  );
}
