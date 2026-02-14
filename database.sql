-- ============================================================
-- INKWELL BLOG PLATFORM — COMPLETE DATABASE SETUP
-- ============================================================
-- This file creates ALL tables, enums, functions, triggers,
-- RLS policies, and storage buckets required by the Inkwell
-- blog platform. Run this in your Supabase SQL Editor
-- (or via psql) against a fresh project.
--
-- Prerequisites:
--   • A Supabase project (free tier works)
--   • Access to the SQL Editor in the Supabase Dashboard
--
-- Usage:
--   1. Open your Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--   4. Then run the setup-admin edge function to create your
--      first admin user (see README.md for details)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────

-- Role enum used for role-based access control
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

-- 2.1 User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  role       public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 2.2 Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  excerpt          TEXT,
  content          TEXT,
  thumbnail_url    TEXT,
  status           TEXT NOT NULL DEFAULT 'draft',
  is_project       BOOLEAN NOT NULL DEFAULT false,
  comments_enabled BOOLEAN NOT NULL DEFAULT true,
  view_count       BIGINT NOT NULL DEFAULT 0,
  author_id        UUID,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Post ↔ Category (many-to-many)
CREATE TABLE IF NOT EXISTS public.post_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE (post_id, category_id)
);

-- 2.5 Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id      UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name    TEXT NOT NULL,
  author_email   TEXT NOT NULL,
  content        TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  likes_count    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 Comment Likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, visitor_id)
);

-- 2.7 Site Settings (singleton row)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title           TEXT NOT NULL DEFAULT 'Inkwell',
  site_description     TEXT NOT NULL DEFAULT 'A modern blog platform',
  site_tagline         TEXT DEFAULT '',
  favicon_url          TEXT DEFAULT '',
  site_icon_url        TEXT DEFAULT '',
  og_image_url         TEXT DEFAULT '',
  meta_keywords        TEXT DEFAULT '',
  meta_author          TEXT DEFAULT '',
  google_analytics_id  TEXT DEFAULT '',
  robots_txt_content   TEXT DEFAULT '',
  custom_head_scripts  TEXT DEFAULT '',
  social_twitter       TEXT DEFAULT '',
  social_facebook      TEXT DEFAULT '',
  social_instagram     TEXT DEFAULT '',
  social_linkedin      TEXT DEFAULT '',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 Shortened Links
CREATE TABLE IF NOT EXISTS public.shortened_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_name    TEXT NOT NULL,
  original_url TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
  alias        TEXT UNIQUE,
  password     TEXT,
  post_slug    TEXT NOT NULL,
  clicks       INTEGER NOT NULL DEFAULT 0,
  admin_id     UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 3. DATABASE FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- 3.1 Check if a user has a specific role (used in RLS policies)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3.2 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3.3 Validate post status and auto-set published_at
CREATE OR REPLACE FUNCTION public.validate_post_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('draft', 'published') THEN
    RAISE EXCEPTION 'Invalid post status: %', NEW.status;
  END IF;
  IF NEW.status = 'published' AND OLD.status = 'draft' THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- 3.4 Auto-generate token for shortened links
CREATE OR REPLACE FUNCTION public.generate_link_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
  END IF;
  RETURN NEW;
END;
$$;

-- 3.5 Increment link click count (called from edge function)
CREATE OR REPLACE FUNCTION public.increment_link_clicks(p_link_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shortened_links
  SET clicks = clicks + 1, updated_at = now()
  WHERE id = p_link_id;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 4. TRIGGERS
-- ────────────────────────────────────────────────────────────

-- updated_at triggers
CREATE OR REPLACE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_shortened_links_updated_at
  BEFORE UPDATE ON public.shortened_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Post status validation
CREATE OR REPLACE TRIGGER validate_post_status_trigger
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_post_status();

-- Auto-generate link token
CREATE OR REPLACE TRIGGER generate_link_token_trigger
  BEFORE INSERT ON public.shortened_links
  FOR EACH ROW EXECUTE FUNCTION public.generate_link_token();


-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.user_roles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortened_links ENABLE ROW LEVEL SECURITY;

-- ── user_roles ──
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR (user_id = auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ── categories ──
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ── posts ──
CREATE POLICY "Anyone can read published posts"
  ON public.posts FOR SELECT
  USING ((status = 'published') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ── post_categories ──
CREATE POLICY "Anyone can read post_categories"
  ON public.post_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert post_categories"
  ON public.post_categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update post_categories"
  ON public.post_categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete post_categories"
  ON public.post_categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ── comments ──
CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ── comment_likes ──
CREATE POLICY "Anyone can read comment_likes"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comment_likes"
  ON public.comment_likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete own comment_likes"
  ON public.comment_likes FOR DELETE
  USING (true);

-- ── site_settings ──
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site_settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_settings"
  ON public.site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site_settings"
  ON public.site_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ── shortened_links ──
CREATE POLICY "Anyone can read shortened_links"
  ON public.shortened_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert shortened_links"
  ON public.shortened_links FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shortened_links"
  ON public.shortened_links FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shortened_links"
  ON public.shortened_links FOR DELETE
  USING (has_role(auth.uid(), 'admin'));


-- ────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKET
-- ────────────────────────────────────────────────────────────

-- Create public bucket for thumbnails and site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to thumbnails bucket
CREATE POLICY "Public read access for thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- Allow authenticated admins to upload to thumbnails bucket
CREATE POLICY "Admins can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated admins to update thumbnails
CREATE POLICY "Admins can update thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated admins to delete thumbnails
CREATE POLICY "Admins can delete thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
  );


-- ────────────────────────────────────────────────────────────
-- 7. SEED DATA
-- ────────────────────────────────────────────────────────────

-- Insert default site settings (one row)
INSERT INTO public.site_settings (site_title, site_description)
VALUES ('Inkwell', 'A modern blog platform')
ON CONFLICT DO NOTHING;


-- ============================================================
-- DONE! Next steps:
--   1. Deploy the edge functions (see README.md)
--   2. Run the setup-admin edge function to create your admin
--   3. Start writing posts!
-- ============================================================
