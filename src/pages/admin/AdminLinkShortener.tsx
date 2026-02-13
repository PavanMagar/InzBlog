import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, ExternalLink, Trash2, Eye, Pencil, Search, Plus, Lock, MousePointerClick } from "lucide-react";

interface ShortenedLink {
  id: string;
  link_name: string;
  original_url: string;
  token: string;
  alias: string | null;
  password: string | null;
  post_slug: string;
  clicks: number;
  created_at: string;
}

export default function AdminLinkShortener() {
  const { toast } = useToast();
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form
  const [linkName, setLinkName] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

  // View dialog
  const [viewLink, setViewLink] = useState<ShortenedLink | null>(null);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("shortened_links")
      .select("*")
      .order("created_at", { ascending: false });
    setLinks((data as ShortenedLink[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const getShortUrl = (link: ShortenedLink) => {
    const identifier = link.alias || link.token;
    return `${window.location.origin}/posts/${link.post_slug}.html?token=${identifier}`;
  };

  const handleCreate = async () => {
    if (!linkName.trim() || !originalUrl.trim()) {
      toast({ title: "Error", description: "Link name and URL are required.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      // Pick random published post
      const { data: posts } = await supabase
        .from("posts")
        .select("slug")
        .eq("status", "published");

      if (!posts || posts.length === 0) {
        toast({ title: "Error", description: "No published posts found.", variant: "destructive" });
        setCreating(false);
        return;
      }
      const randomPost = posts[Math.floor(Math.random() * posts.length)];

      const insertData: any = {
        link_name: linkName.trim(),
        original_url: originalUrl.trim(),
        post_slug: randomPost.slug,
        token: customAlias.trim() || undefined,
      };
      if (customAlias.trim()) insertData.alias = customAlias.trim();
      if (password.trim()) insertData.password = password.trim();

      const { data, error } = await supabase
        .from("shortened_links")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const link = data as ShortenedLink;
      const url = getShortUrl(link);
      setGeneratedUrl(url);
      setLinkName("");
      setOriginalUrl("");
      setCustomAlias("");
      setPassword("");
      toast({ title: "Link created!", description: "Your shortened link is ready." });
      fetchLinks();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await supabase.from("shortened_links").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchLinks();
  };

  const handleEdit = async (id: string) => {
    const { error } = await supabase
      .from("shortened_links")
      .update({ link_name: editName, original_url: editUrl })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated" });
      setEditId(null);
      fetchLinks();
    }
  };

  const copyUrl = (link: ShortenedLink) => {
    navigator.clipboard.writeText(getShortUrl(link));
    toast({ title: "Copied to clipboard!" });
  };

  const filtered = links.filter(
    (l) =>
      l.link_name.toLowerCase().includes(search.toLowerCase()) ||
      l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Link Shortener</h1>

          {/* Create Form */}
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-4 w-4" /> Create Short Link</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Link Name *</Label><Input value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="My Awesome Link" /></div>
                <div><Label>Original URL *</Label><Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://example.com" /></div>
                <div><Label>Custom Alias (optional)</Label><Input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} placeholder="my-link" /></div>
                <div><Label>Password (optional)</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" /></div>
              </div>
              <Button onClick={handleCreate} disabled={creating} style={{ background: "var(--gradient-primary)" }} className="text-white">
                {creating ? "Creating..." : "Create Link"}
              </Button>

              {generatedUrl && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="mb-2 text-sm font-medium text-foreground">Generated Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-secondary px-3 py-2 text-sm">{generatedUrl}</code>
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedUrl); toast({ title: "Copied!" }); }}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(generatedUrl, "_blank")}><ExternalLink className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links List */}
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-lg"><Link2 className="h-4 w-4" /> All Links ({filtered.length})</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No links found.</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((link) => (
                    <div key={link.id} className="rounded-xl border border-border/60 bg-background/50 p-4">
                      {editId === link.id ? (
                        <div className="space-y-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Link name" />
                            <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="Original URL" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(link.id)}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">{link.link_name}</span>
                              {link.password && <Badge variant="secondary" className="gap-1 text-xs"><Lock className="h-3 w-3" />Protected</Badge>}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>{new Date(link.created_at).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{link.clicks} clicks</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 border-t border-border/40 pt-2 sm:border-0 sm:pt-0">
                            <Button size="icon" variant="ghost" onClick={() => setViewLink(link)}><Eye className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => { setEditId(link.id); setEditName(link.link_name); setEditUrl(link.original_url); }}><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => copyUrl(link)}><Copy className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => window.open(getShortUrl(link), "_blank")}><ExternalLink className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(link.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* View Dialog */}
      <Dialog open={!!viewLink} onOpenChange={() => setViewLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewLink?.link_name}</DialogTitle>
            <DialogDescription>Link details</DialogDescription>
          </DialogHeader>
          {viewLink && (
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">Original URL:</span> <a href={viewLink.original_url} target="_blank" className="text-primary hover:underline break-all">{viewLink.original_url}</a></div>
              <div><span className="font-medium">Short URL:</span> <code className="break-all text-xs">{getShortUrl(viewLink)}</code></div>
              <div><span className="font-medium">Created:</span> {new Date(viewLink.created_at).toLocaleString()}</div>
              <div><span className="font-medium">Clicks:</span> {viewLink.clicks}</div>
              <div><span className="font-medium">Password:</span> {viewLink.password ? "Yes" : "No"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
