
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    thumbnail_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    view_count BIGINT NOT NULL DEFAULT 0,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create post_categories junction table
CREATE TABLE public.post_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (post_id, category_id)
);
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- RLS: user_roles - only admins can view/manage roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS: categories - public read, admin write
CREATE POLICY "Anyone can read categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS: posts - public read published, admin full access
CREATE POLICY "Anyone can read published posts" ON public.posts
    FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts" ON public.posts
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts" ON public.posts
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" ON public.posts
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS: post_categories - public read, admin write
CREATE POLICY "Anyone can read post_categories" ON public.post_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert post_categories" ON public.post_categories
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update post_categories" ON public.post_categories
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete post_categories" ON public.post_categories
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger for post status
CREATE OR REPLACE FUNCTION public.validate_post_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('draft', 'published') THEN
        RAISE EXCEPTION 'Invalid post status: %', NEW.status;
    END IF;
    IF NEW.status = 'published' AND OLD.status = 'draft' THEN
        NEW.published_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_post_status_trigger
    BEFORE INSERT OR UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.validate_post_status();
