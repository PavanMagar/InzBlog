
-- Create shortened_links table
CREATE TABLE public.shortened_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_name text NOT NULL,
  original_url text NOT NULL,
  token text NOT NULL UNIQUE,
  alias text UNIQUE,
  password text,
  post_slug text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-generate random 10-char token
CREATE OR REPLACE FUNCTION public.generate_link_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.token IS NULL OR NEW.token = '' THEN
    NEW.token := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_link_token
BEFORE INSERT ON public.shortened_links
FOR EACH ROW
EXECUTE FUNCTION public.generate_link_token();

-- Auto-update updated_at
CREATE TRIGGER update_shortened_links_updated_at
BEFORE UPDATE ON public.shortened_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.shortened_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for public token lookup)
CREATE POLICY "Anyone can read shortened_links"
ON public.shortened_links
FOR SELECT
USING (true);

-- Admins can insert
CREATE POLICY "Admins can insert shortened_links"
ON public.shortened_links
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update shortened_links"
ON public.shortened_links
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete shortened_links"
ON public.shortened_links
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Increment clicks function
CREATE OR REPLACE FUNCTION public.increment_link_clicks(p_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.shortened_links SET clicks = clicks + 1, updated_at = NOW() WHERE id = p_link_id;
END;
$$;
