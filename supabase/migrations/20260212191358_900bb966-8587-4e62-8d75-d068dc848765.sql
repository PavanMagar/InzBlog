
-- Create storage bucket for post thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- Allow anyone to view thumbnails
CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Allow admins to upload thumbnails
CREATE POLICY "Admins can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow admins to update thumbnails
CREATE POLICY "Admins can update thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Allow admins to delete thumbnails
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));
