import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Eye, EyeOff, Globe, Image as ImageIcon, Search, Share2, Code, Upload, X, Trash2, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SiteSettings {
  id: string;
  site_title: string;
  site_description: string;
  site_tagline: string;
  favicon_url: string;
  site_icon_url: string;
  og_image_url: string;
  meta_keywords: string;
  meta_author: string;
  google_analytics_id: string;
  robots_txt_content: string;
  custom_head_scripts: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
}

const defaultSettings: Omit<SiteSettings, "id"> = {
  site_title: "Inkwell",
  site_description: "A modern blog platform",
  site_tagline: "",
  favicon_url: "",
  site_icon_url: "",
  og_image_url: "",
  meta_keywords: "",
  meta_author: "",
  google_analytics_id: "",
  robots_txt_content: "",
  custom_head_scripts: "",
  social_twitter: "",
  social_facebook: "",
  social_instagram: "",
  social_linkedin: "",
};

export default function AdminSettings() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Site settings
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // File upload refs
  const faviconRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const ogRef = useRef<HTMLInputElement>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).single();
      if (data) setSettings(data as SiteSettings);
      setLoadingSettings(false);
    };
    fetchSettings();
  }, []);

  const updateField = (field: keyof Omit<SiteSettings, "id">, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleImageUpload = async (file: File, field: "favicon_url" | "site_icon_url" | "og_image_url") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setUploadingField(field);
    const fileExt = file.name.split(".").pop();
    const fileName = `site-${field}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("thumbnails").upload(fileName, file);
    if (error) {
      toast.error("Upload failed");
      setUploadingField(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
    updateField(field, urlData.publicUrl);
    setUploadingField(null);
    toast.success("Image uploaded");
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const { id, ...rest } = settings;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
    if (error) {
      toast.error("Failed to save settings: " + error.message);
    } else {
      toast.success("Settings saved successfully");
    }
    setSavingSettings(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) toast.error(error.message);
    else { toast.success("Email update requested. Check your new email for confirmation."); setNewEmail(""); }
    setSavingEmail(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPassword(""); setConfirmPassword(""); }
    setSavingPassword(false);
  };

  const ImageUploadField = ({
    label,
    field,
    hint,
    inputRef,
  }: {
    label: string;
    field: "favicon_url" | "site_icon_url" | "og_image_url";
    hint: string;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-card-foreground">{label}</label>
      <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      <input
        value={settings?.[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        className="mb-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        placeholder="Paste image URL or upload..."
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploadingField === field}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {uploadingField === field ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploadingField === field ? "Uploading..." : "Upload"}
        </button>
        {settings?.[field] && (
          <button
            onClick={() => updateField(field, "")}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, field);
          }}
        />
      </div>
      {settings?.[field] && (
        <div className="relative mt-3">
          <img
            src={settings[field]}
            alt={label}
            className="h-20 rounded-lg border border-border object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="border-b border-border bg-card px-4 py-5 sm:px-8 sm:py-6 lg:pl-8 pl-16">
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your site and account settings</p>
        </div>

        <div className="mx-auto max-w-3xl p-4 sm:p-8">
          <Tabs defaultValue="site" className="space-y-6">
            <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="site" className="gap-2 rounded-lg" title="Site"><Globe className="h-4 w-4" />{!isMobile && " Site"}</TabsTrigger>
              <TabsTrigger value="seo" className="gap-2 rounded-lg" title="SEO"><Search className="h-4 w-4" />{!isMobile && " SEO"}</TabsTrigger>
              <TabsTrigger value="social" className="gap-2 rounded-lg" title="Social"><Share2 className="h-4 w-4" />{!isMobile && " Social"}</TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2 rounded-lg" title="Advanced"><Code className="h-4 w-4" />{!isMobile && " Advanced"}</TabsTrigger>
              <TabsTrigger value="account" className="gap-2 rounded-lg" title="Account"><User className="h-4 w-4" />{!isMobile && " Account"}</TabsTrigger>
            </TabsList>

            {/* SITE TAB */}
            <TabsContent value="site" className="space-y-6">
              {loadingSettings ? (
                <div className="flex justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : settings ? (
                <>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 space-y-5">
                    <h2 className="font-display text-lg font-semibold text-card-foreground">General</h2>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Site Title</label>
                      <input
                        value={settings.site_title}
                        onChange={(e) => updateField("site_title", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Your website name"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Tagline</label>
                      <input
                        value={settings.site_tagline}
                        onChange={(e) => updateField("site_tagline", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="A short tagline for your site"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Site Description</label>
                      <textarea
                        value={settings.site_description}
                        onChange={(e) => updateField("site_description", e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Describe your website..."
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 space-y-5">
                    <h2 className="font-display text-lg font-semibold text-card-foreground">Images & Branding</h2>
                    <ImageUploadField
                      label="Favicon"
                      field="favicon_url"
                      hint="Recommended: 32×32px or 64×64px PNG/ICO. Shown in browser tabs."
                      inputRef={faviconRef as React.RefObject<HTMLInputElement>}
                    />
                    <ImageUploadField
                      label="Site Icon / Logo"
                      field="site_icon_url"
                      hint="Recommended: 512×512px PNG. Used as app icon and branding."
                      inputRef={iconRef as React.RefObject<HTMLInputElement>}
                    />
                    <ImageUploadField
                      label="Default OG Image"
                      field="og_image_url"
                      hint="Recommended: 1200×630px. Shown when sharing links on social media."
                      inputRef={ogRef as React.RefObject<HTMLInputElement>}
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="rounded-xl px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingSettings ? "Saving..." : "Save Site Settings"}
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground">Failed to load settings.</p>
              )}
            </TabsContent>

            {/* SEO TAB */}
            <TabsContent value="seo" className="space-y-6">
              {settings && (
                <>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 space-y-5">
                    <h2 className="font-display text-lg font-semibold text-card-foreground">SEO & Metadata</h2>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Meta Keywords</label>
                      <p className="mb-1 text-xs text-muted-foreground">Comma-separated keywords for search engines.</p>
                      <input
                        value={settings.meta_keywords}
                        onChange={(e) => updateField("meta_keywords", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="blog, technology, news..."
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Meta Author</label>
                      <input
                        value={settings.meta_author}
                        onChange={(e) => updateField("meta_author", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Google Analytics ID</label>
                      <p className="mb-1 text-xs text-muted-foreground">Format: G-XXXXXXXXXX</p>
                      <input
                        value={settings.google_analytics_id}
                        onChange={(e) => updateField("google_analytics_id", e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="rounded-xl px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingSettings ? "Saving..." : "Save SEO Settings"}
                  </button>
                </>
              )}
            </TabsContent>

            {/* SOCIAL TAB */}
            <TabsContent value="social" className="space-y-6">
              {settings && (
                <>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 space-y-5">
                    <h2 className="font-display text-lg font-semibold text-card-foreground">Social Media Links</h2>
                    {[
                      { label: "Twitter / X", field: "social_twitter" as const, placeholder: "https://x.com/yourhandle" },
                      { label: "Facebook", field: "social_facebook" as const, placeholder: "https://facebook.com/yourpage" },
                      { label: "Instagram", field: "social_instagram" as const, placeholder: "https://instagram.com/yourhandle" },
                      { label: "LinkedIn", field: "social_linkedin" as const, placeholder: "https://linkedin.com/in/yourprofile" },
                    ].map((s) => (
                      <div key={s.field}>
                        <label className="mb-1.5 block text-sm font-medium text-card-foreground">{s.label}</label>
                        <input
                          value={settings[s.field]}
                          onChange={(e) => updateField(s.field, e.target.value)}
                          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          placeholder={s.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="rounded-xl px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingSettings ? "Saving..." : "Save Social Settings"}
                  </button>
                </>
              )}
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-6">
              {settings && (
                <>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 space-y-5">
                    <h2 className="font-display text-lg font-semibold text-card-foreground">Advanced</h2>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">Custom Head Scripts</label>
                      <p className="mb-1 text-xs text-muted-foreground">
                        Add custom scripts or meta tags to the &lt;head&gt; section. Be careful — invalid code may break the site.
                      </p>
                      <textarea
                        value={settings.custom_head_scripts}
                        onChange={(e) => updateField("custom_head_scripts", e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                        placeholder='<meta name="verify" content="..." />'
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-card-foreground">robots.txt Content</label>
                      <p className="mb-1 text-xs text-muted-foreground">Custom robots.txt directives for search engine crawlers.</p>
                      <textarea
                        value={settings.robots_txt_content}
                        onChange={(e) => updateField("robots_txt_content", e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                        placeholder={"User-agent: *\nAllow: /"}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="rounded-xl px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingSettings ? "Saving..." : "Save Advanced Settings"}
                  </button>
                </>
              )}
            </TabsContent>

            {/* ACCOUNT TAB */}
            <TabsContent value="account" className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Account Information</h2>
                <div className="rounded-xl bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Current Email</p>
                  <p className="text-sm font-medium text-card-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Update Email</h2>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="newemail@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingEmail}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingEmail ? "Updating..." : "Update Email"}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-card-foreground">Update Password</h2>
                  <button onClick={() => setShowPasswords(!showPasswords)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Confirm New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
