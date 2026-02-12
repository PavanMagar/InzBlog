
-- Comments table with nested replies support
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comment likes table
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, visitor_id)
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Comments policies: anyone can read, anyone can insert, only admins can delete/update
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update comments" ON public.comments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete comments" ON public.comments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Comment likes policies: anyone can read/insert/delete their own
CREATE POLICY "Anyone can read comment_likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comment_likes" ON public.comment_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete own comment_likes" ON public.comment_likes FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_likes;
