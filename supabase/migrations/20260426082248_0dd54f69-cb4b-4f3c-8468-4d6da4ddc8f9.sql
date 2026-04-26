-- 1. Add bio column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- 2. Public portfolio view: only safe fields, no PII
CREATE OR REPLACE VIEW public.public_portfolios
WITH (security_invoker=on) AS
SELECT
  id,
  name,
  department,
  year,
  semester,
  section,
  cgpa,
  college,
  profile_picture,
  bio,
  github_id,
  linkedin_id,
  resume_link,
  portfolio_link
FROM public.profiles
WHERE profile_completed = true;

-- 3. SECURITY DEFINER function to fetch one portfolio publicly (bypasses profiles RLS,
--    returns only non-sensitive columns). Excludes mobile, address, parents, dob, etc.
CREATE OR REPLACE FUNCTION public.get_public_portfolio(_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  department text,
  year integer,
  semester integer,
  section text,
  cgpa numeric,
  college text,
  profile_picture text,
  bio text,
  github_id text,
  linkedin_id text,
  resume_link text,
  portfolio_link text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.name, p.department, p.year, p.semester, p.section,
    p.cgpa, p.college, p.profile_picture, p.bio,
    p.github_id, p.linkedin_id, p.resume_link, p.portfolio_link
  FROM public.profiles p
  WHERE p.id = _user_id
$$;

-- Allow anonymous and authenticated users to call it
GRANT EXECUTE ON FUNCTION public.get_public_portfolio(uuid) TO anon, authenticated;