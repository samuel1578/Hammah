-- ============================================================
-- HAMMAH — Sprint 0.19A: Customer Auth & Security Foundation
-- ============================================================
-- 1. Profile creation trigger on auth.users INSERT
-- 2. Role escalation prevention trigger on profiles UPDATE
-- 3. RLS policy fixes for profiles
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. FUNCTION: Auto-create profile on user signup
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'phone'), ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- 2. TRIGGER: Fire handle_new_user on auth.users INSERT
-- ─────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 3. FUNCTION: Prevent non-admin role changes
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow if the current user is an admin
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Permission denied: only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- 4. TRIGGER: Enforce role escalation prevention
-- ─────────────────────────────────────────────

DROP TRIGGER IF EXISTS profiles_role_guard ON public.profiles;

CREATE TRIGGER profiles_role_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ─────────────────────────────────────────────
-- 5. RLS POLICIES: Replace existing profile policies
-- ─────────────────────────────────────────────

-- Drop existing policies that need replacement
DROP POLICY IF EXISTS "Profiles: user can update own profile" ON public.profiles;

-- Recreate with column-safe UPDATE policy
-- Users can update their own profile but NOT role
CREATE POLICY "Profiles: user can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- END OF MIGRATION
-- ============================================================
