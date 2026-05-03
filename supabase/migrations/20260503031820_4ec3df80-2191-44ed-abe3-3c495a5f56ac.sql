
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  application_id uuid,
  scanned_by uuid,
  direction text NOT NULL DEFAULT 'entry',
  result text NOT NULL DEFAULT 'verified',
  scanned_code text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_logs_student ON public.scan_logs(student_id, created_at DESC);

ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own scans"
  ON public.scan_logs FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins and security view all scans"
  ON public.scan_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'security'));

CREATE POLICY "Gate staff insert scans"
  ON public.scan_logs FOR INSERT
  WITH CHECK (
    (public.has_role(auth.uid(), 'security') OR public.has_role(auth.uid(), 'admin'))
    AND scanned_by = auth.uid()
  );

CREATE POLICY "Security can view profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'security'));

CREATE POLICY "Security can view applications"
  ON public.applications FOR SELECT
  USING (public.has_role(auth.uid(), 'security'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_logs;
