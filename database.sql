-- ============================================================
-- INKWELL BLOG PLATFORM — COMPLETE DATABASE SETUP
-- ============================================================
-- This file creates ALL tables, enums, functions, triggers,
-- RLS policies, storage buckets, admin user, and demo data
-- required by the Inkwell blog platform.
--
-- Run this in your Supabase SQL Editor (or via psql).
--
-- Prerequisites:
--   • A Supabase project (free tier works)
--   • Access to the SQL Editor in the Supabase Dashboard
--
-- Usage:
--   1. Open your Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--   4. Log in with admin@admin.com / admin1234
--   5. Change your credentials from Admin → Settings → Account
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  role       public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.post_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE (post_id, category_id)
);

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

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, visitor_id)
);

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

CREATE OR REPLACE TRIGGER validate_post_status_trigger
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_post_status();

CREATE OR REPLACE TRIGGER generate_link_token_trigger
  BEFORE INSERT ON public.shortened_links
  FOR EACH ROW EXECUTE FUNCTION public.generate_link_token();


-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.user_roles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortened_links ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR (user_id = auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- posts
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

-- post_categories
CREATE POLICY "Anyone can read post_categories"
  ON public.post_categories FOR SELECT USING (true);

CREATE POLICY "Admins can insert post_categories"
  ON public.post_categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update post_categories"
  ON public.post_categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete post_categories"
  ON public.post_categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- comments
CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- comment_likes
CREATE POLICY "Anyone can read comment_likes"
  ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comment_likes"
  ON public.comment_likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete own comment_likes"
  ON public.comment_likes FOR DELETE USING (true);

-- site_settings
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert site_settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_settings"
  ON public.site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site_settings"
  ON public.site_settings FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- shortened_links
CREATE POLICY "Anyone can read shortened_links"
  ON public.shortened_links FOR SELECT USING (true);

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

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Admins can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 7. ADMIN USER SETUP
-- ────────────────────────────────────────────────────────────
-- The admin user is created via the setup-admin Edge Function.
-- After running this SQL, invoke the Edge Function to create:
--
--   Email:    admin@admin.com
--   Password: admin1234
--
-- You can change these credentials from Admin → Settings → Account.
--
-- To invoke the Edge Function:
--   curl -X POST https://<your-project-ref>.supabase.co/functions/v1/setup-admin \
--     -H "Authorization: Bearer <your-anon-key>" \
--     -H "Content-Type: application/json"
-- ────────────────────────────────────────────────────────────


-- ────────────────────────────────────────────────────────────
-- 8. SEED DATA — Site Settings
-- ────────────────────────────────────────────────────────────

INSERT INTO public.site_settings (site_title, site_description, site_tagline, meta_author)
VALUES ('Inkwell', 'A modern blog platform built with React and Supabase', 'Write. Share. Inspire.', 'Inkwell Admin')
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 9. SEED DATA — Demo Categories
-- ────────────────────────────────────────────────────────────

INSERT INTO public.categories (name, slug) VALUES
  ('Technology',   'technology'),
  ('Design',       'design'),
  ('Development',  'development'),
  ('Tutorials',    'tutorials'),
  ('News',         'news'),
  ('Lifestyle',    'lifestyle')
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 10. SEED DATA — Demo Posts
-- ────────────────────────────────────────────────────────────

INSERT INTO public.posts (title, slug, excerpt, content, status, is_project, published_at, view_count) VALUES
(
  'Getting Started with Inkwell',
  'getting-started-with-inkwell',
  'Learn how to set up and customize your Inkwell blog platform from scratch.',
  '<h2>Welcome to Inkwell!</h2>
<p>Inkwell is a modern, full-featured blog platform built with <strong>React</strong>, <strong>TypeScript</strong>, and <strong>Supabase</strong>. This guide will walk you through the basics of managing your new blog.</p>
<h3>Writing Your First Post</h3>
<p>Head over to the <strong>Admin Dashboard</strong> and click on <em>Posts → New Post</em>. You''ll find a rich text editor with support for:</p>
<ul>
<li>Bold, italic, and underline formatting</li>
<li>Headings (H1–H6)</li>
<li>Ordered and unordered lists</li>
<li>Links and images</li>
<li>Code blocks</li>
</ul>
<h3>Managing Categories</h3>
<p>Organize your content with categories. Navigate to <em>Admin → Categories</em> to create, edit, or delete categories. Each post can belong to multiple categories.</p>
<h3>Customizing Your Site</h3>
<p>Visit <em>Admin → Settings</em> to configure your site title, description, social links, SEO settings, and more. You can also upload a favicon and OG image for social sharing.</p>
<p>Happy blogging! 🎉</p>',
  'published',
  false,
  now() - interval '2 days',
  42
),
(
  'Top 10 Tips for Better Web Design',
  'top-10-tips-better-web-design',
  'Improve your web design skills with these practical tips that every developer should know.',
  '<h2>Design Matters</h2>
<p>Great web design isn''t just about aesthetics — it''s about creating experiences that are intuitive, accessible, and delightful. Here are 10 tips to level up your designs:</p>
<h3>1. Start with Typography</h3>
<p>Choose a clear, readable font pair. Use a distinctive display font for headings and a clean sans-serif for body text. Ensure proper line height (1.5–1.8 for body text).</p>
<h3>2. Embrace White Space</h3>
<p>Don''t be afraid of empty space. It helps guide the eye and makes content easier to digest.</p>
<h3>3. Use a Consistent Color Palette</h3>
<p>Pick 2–3 primary colors and stick with them. Use tools like <a href="https://coolors.co">Coolors</a> to generate harmonious palettes.</p>
<h3>4. Design Mobile-First</h3>
<p>Start with the smallest screen and progressively enhance for larger viewports.</p>
<h3>5. Optimize Images</h3>
<p>Compress images, use modern formats (WebP/AVIF), and always include meaningful alt text.</p>
<h3>6. Create Visual Hierarchy</h3>
<p>Use size, weight, color, and spacing to establish clear importance levels in your content.</p>
<h3>7. Make CTAs Obvious</h3>
<p>Buttons should look clickable. Use contrasting colors and clear action-oriented labels.</p>
<h3>8. Test Accessibility</h3>
<p>Ensure sufficient color contrast, keyboard navigation, and screen reader compatibility.</p>
<h3>9. Keep Navigation Simple</h3>
<p>Users should find what they need within 3 clicks. Use clear labels and logical grouping.</p>
<h3>10. Iterate Based on Feedback</h3>
<p>Launch early, gather real user feedback, and continuously refine your design.</p>',
  'published',
  false,
  now() - interval '5 days',
  128
),
(
  'Building a REST API with Supabase',
  'building-rest-api-supabase',
  'A step-by-step tutorial on creating a powerful REST API using Supabase as your backend.',
  '<h2>Why Supabase?</h2>
<p>Supabase provides an instant REST API on top of your PostgreSQL database, plus authentication, storage, and real-time subscriptions — all out of the box.</p>
<h3>Setting Up Your Project</h3>
<p>Create a new project on <a href="https://supabase.com">supabase.com</a> and grab your project URL and anon key from the settings page.</p>
<h3>Creating Tables</h3>
<p>Use the SQL Editor or the Table Editor to define your schema. For example:</p>
<pre><code>CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);</code></pre>
<h3>Row Level Security</h3>
<p>Always enable RLS on your tables and create policies to control who can read and write data. This is crucial for production security.</p>
<h3>Querying Data</h3>
<p>Use the Supabase client library to query your data:</p>
<pre><code>const { data, error } = await supabase
  .from("articles")
  .select("*")
  .order("created_at", { ascending: false });</code></pre>
<p>That''s it! You now have a fully functional API with authentication and security built in.</p>',
  'published',
  false,
  now() - interval '7 days',
  95
),
(
  'My Portfolio Website',
  'my-portfolio-website',
  'A showcase of my personal portfolio website built with modern web technologies.',
  '<h2>Project Overview</h2>
<p>This is my personal portfolio website, designed to showcase my work, skills, and experience as a web developer.</p>
<h3>Tech Stack</h3>
<ul>
<li><strong>Frontend:</strong> React + TypeScript</li>
<li><strong>Styling:</strong> Tailwind CSS</li>
<li><strong>Animations:</strong> Framer Motion</li>
<li><strong>Backend:</strong> Supabase</li>
<li><strong>Deployment:</strong> Vercel</li>
</ul>
<h3>Key Features</h3>
<ul>
<li>Responsive design with dark/light mode</li>
<li>Interactive project showcase with filtering</li>
<li>Contact form with email notifications</li>
<li>Blog section with markdown support</li>
<li>SEO optimized with dynamic meta tags</li>
</ul>
<p>Feel free to check it out and reach out if you have any questions!</p>',
  'published',
  true,
  now() - interval '10 days',
  67
),
(
  'Understanding React Hooks',
  'understanding-react-hooks',
  'A comprehensive guide to React Hooks — from useState to custom hooks.',
  '<h2>What Are Hooks?</h2>
<p>React Hooks let you use state and other React features in function components. Introduced in React 16.8, they''ve become the standard way to write React code.</p>
<h3>useState</h3>
<p>The most basic hook for managing local component state:</p>
<pre><code>const [count, setCount] = useState(0);</code></pre>
<h3>useEffect</h3>
<p>For side effects like data fetching, subscriptions, or DOM manipulation:</p>
<pre><code>useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);</code></pre>
<h3>useContext</h3>
<p>Access context values without wrapping components in Consumer tags:</p>
<pre><code>const theme = useContext(ThemeContext);</code></pre>
<h3>Custom Hooks</h3>
<p>Extract reusable logic into custom hooks. Prefix with "use" by convention:</p>
<pre><code>function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}</code></pre>
<p>Hooks make your code cleaner, more reusable, and easier to test.</p>',
  'draft',
  false,
  NULL,
  0
)
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 11. SEED DATA — Link Posts to Categories
-- ────────────────────────────────────────────────────────────

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'getting-started-with-inkwell' AND c.slug = 'tutorials'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'top-10-tips-better-web-design' AND c.slug = 'design'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'building-rest-api-supabase' AND c.slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'building-rest-api-supabase' AND c.slug = 'tutorials'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'my-portfolio-website' AND c.slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'my-portfolio-website' AND c.slug = 'design'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'understanding-react-hooks' AND c.slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_categories (post_id, category_id)
SELECT p.id, c.id FROM public.posts p, public.categories c
WHERE p.slug = 'understanding-react-hooks' AND c.slug = 'tutorials'
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 12. SEED DATA — Demo Comments
-- ────────────────────────────────────────────────────────────

INSERT INTO public.comments (post_id, author_name, author_email, content)
SELECT p.id, 'Alice Johnson', 'alice@example.com', 'Great introduction! This helped me get started quickly. Looking forward to more tutorials like this.'
FROM public.posts p WHERE p.slug = 'getting-started-with-inkwell'
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, author_name, author_email, content)
SELECT p.id, 'Bob Smith', 'bob@example.com', 'Tip #2 about white space is so underrated. Most beginners tend to cram everything together. Great list!'
FROM public.posts p WHERE p.slug = 'top-10-tips-better-web-design'
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, author_name, author_email, content)
SELECT p.id, 'Charlie Dev', 'charlie@example.com', 'Supabase has been a game-changer for my projects. Thanks for the clear walkthrough!'
FROM public.posts p WHERE p.slug = 'building-rest-api-supabase'
ON CONFLICT DO NOTHING;

INSERT INTO public.comments (post_id, author_name, author_email, content)
SELECT p.id, 'Diana Lee', 'diana@example.com', 'Love the clean design of your portfolio. What font pair did you use?'
FROM public.posts p WHERE p.slug = 'my-portfolio-website'
ON CONFLICT DO NOTHING;


-- ============================================================
-- DONE! Next steps:
--   1. Deploy the setup-admin Edge Function (see README.md)
--   2. Invoke it to create admin@admin.com / admin1234
--   3. Log in and start writing posts!
--   4. Change your credentials: Admin → Settings → Account
-- ============================================================
