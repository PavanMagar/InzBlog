import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    const name = newName.trim();
    if (!name) return;
    const { error } = await supabase.from("categories").insert({ name, slug: slugify(name) });
    if (error) toast.error(error.message.includes("duplicate") ? "Category already exists" : "Failed to add category");
    else { toast.success("Category added"); setNewName(""); fetchCategories(); }
  };

  const updateCategory = async () => {
    const name = editName.trim();
    if (!name || !editId) return;
    const { error } = await supabase.from("categories").update({ name, slug: slugify(name) }).eq("id", editId);
    if (error) toast.error("Failed to update");
    else { toast.success("Updated"); setEditId(null); fetchCategories(); }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchCategories(); }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-8 py-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage your blog categories</p>
        </div>

        <div className="p-8">
          {/* Add new */}
          <div className="mb-8 flex gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="New category name..."
              className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={addCategory}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3 shadow-[var(--shadow-card)]">
                  {editId === cat.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                        className="h-8 flex-1 rounded border border-input bg-background px-2 text-sm outline-none"
                        autoFocus
                      />
                      <button onClick={updateCategory} className="rounded p-1 text-primary hover:bg-muted"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditId(null)} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-sm font-medium text-card-foreground">{cat.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">/{cat.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
