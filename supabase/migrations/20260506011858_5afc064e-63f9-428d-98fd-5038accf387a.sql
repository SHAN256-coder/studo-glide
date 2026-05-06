
-- Feedback table
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback" ON public.feedbacks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own feedback" ON public.feedbacks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own feedback" ON public.feedbacks
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own feedback" ON public.feedbacks
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all feedback" ON public.feedbacks
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Feedback image storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-images', 'feedback-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Feedback images are publicly viewable"
  ON storage.objects FOR SELECT USING (bucket_id = 'feedback-images');

CREATE POLICY "Users can upload feedback images to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'feedback-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own feedback images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'feedback-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own feedback images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'feedback-images' AND auth.uid()::text = (storage.foldername(name))[1]);
