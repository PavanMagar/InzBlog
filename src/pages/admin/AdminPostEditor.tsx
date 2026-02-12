import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminPostEditor() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const fetchPost = async () => {
      const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || "");
        setThumbnailUrl(post.thumbnail_url || "");
        setContent(post.content || "");
        setStatus(post.status);
      }
      const { data: pc } = await supabase.from("post_categories").select("category_id").eq("post_id", id);
      if (pc) setSelectedCategories(pc.map((p) => p.category_id));
      setLoading(false);
    };
    fetchPost();
  }, [id, isEditing]);

  useEffect(() => {
    if (!isEditing) setSlug(slugify(title));
  }, [title, isEditing]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = async (publishStatus: string) => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      content,
      status: publishStatus,
      author_id: user?.id,
    };

    let postId = id;

    if (isEditing) {
      const { error } = await supabase.from("posts").update(postData).eq("id", id);
      if (error) { toast.error("Failed to update post"); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("posts").insert(postData).select("id").single();
      if (error) { toast.error("Failed to create post: " + error.message); setSaving(false); return; }
      postId = data.id;
    }

    await supabase.from("post_categories").delete().eq("post_id", postId!);
    if (selectedCategories.length > 0) {
      await supabase.from("post_categories").insert(
        selectedCategories.map((catId) => ({ post_id: postId!, category_id: catId }))
      );
    }

    toast.success(isEditing ? "Post updated!" : "Post created!");
    navigate("/admin/posts");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-6 py-6 md:px-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isEditing ? "Edit Post" : "Create New Post"}
          </h1>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-8">
            {/* Main content */}
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base font-medium outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Short description..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 text-sm font-semibold text-card-foreground">Publish</h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => handleSave("draft")}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSave("published")}
                    disabled={saving}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isEditing && status === "published" ? "Update" : "Publish"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-3 text-sm font-semibold text-card-foreground">Thumbnail URL</h3>
                <input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://..."
                />
                {thumbnailUrl && (
                  <img src={thumbnailUrl} alt="Thumbnail" className="mt-3 rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-3 text-sm font-semibold text-card-foreground">Categories</h3>
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No categories yet.</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm text-card-foreground">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded border-input"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
