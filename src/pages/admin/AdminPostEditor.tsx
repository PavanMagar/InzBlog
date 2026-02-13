import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Upload, X, Image as ImageIcon, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

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
        setCommentsEnabled(post.comments_enabled ?? true);
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

  const addNewCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const catSlug = slugify(name);
    const { data, error } = await supabase.from("categories").insert({ name, slug: catSlug }).select("id, name").single();
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Category already exists" : "Failed to create category");
      return;
    }
    if (data) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategories((prev) => [...prev, data.id]);
      setNewCategoryName("");
      setShowNewCategory(false);
      toast.success("Category created");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from("thumbnails").upload(fileName, file);
    if (error) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
    setThumbnailUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
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
      comments_enabled: commentsEnabled,
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
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            {isEditing ? "Edit Post" : "Create New Post"}
          </h1>
        </div>

        <div className="p-4 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
            {/* Main content */}
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-medium outline-none focus:ring-2 focus:ring-ring"
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
              {/* Thumbnail */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-3 text-sm font-semibold text-card-foreground">Thumbnail</h3>
                <input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="mb-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Paste image URL..."
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload from device"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
                {thumbnailUrl && (
                  <div className="relative mt-3">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full rounded-xl border border-border object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <button
                      onClick={() => setThumbnailUrl("")}
                      className="absolute right-2 top-2 rounded-lg bg-foreground/60 p-1 text-background hover:bg-foreground/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Toggle */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <Label htmlFor="comments-toggle" className="text-sm font-semibold text-card-foreground cursor-pointer">
                      Comments
                    </Label>
                  </div>
                  <Switch
                    id="comments-toggle"
                    checked={commentsEnabled}
                    onCheckedChange={setCommentsEnabled}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {commentsEnabled ? "Readers can leave comments on this post." : "Comments are disabled for this post."}
                </p>
              </div>

              {/* Categories */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-card-foreground">Categories</h3>
                  <button
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="rounded-lg p-1 text-primary hover:bg-primary/10"
                    title="Add new category"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {showNewCategory && (
                  <div className="mb-3 flex gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addNewCategory()}
                      placeholder="New category..."
                      className="h-8 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none"
                      autoFocus
                    />
                    <button onClick={addNewCategory} className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90">
                      Add
                    </button>
                  </div>
                )}

                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No categories yet.</p>
                ) : (
                  <div className="max-h-48 space-y-1.5 overflow-y-auto">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-card-foreground hover:bg-muted">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="rounded border-input accent-primary"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish - placed at end */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 text-sm font-semibold text-card-foreground">Publish</h3>
                <div className="flex gap-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
