-- ============================================================
-- HAMMAH — Sprint 0.19 Corrective Pass: Signup Birthday
-- ============================================================
-- Update handle_new_user() trigger to extract date_of_birth
-- from signup metadata into profiles.date_of_birth.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. FUNCTION: Replace handle_new_user to include DOB
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dob date;
BEGIN
  -- Safely parse date_of_birth from signup metadata
  IF NEW.raw_user_meta_data ? 'date_of_birth'
     AND NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL
     AND TRIM(NEW.raw_user_meta_data ->> 'date_of_birth') != '' THEN
    BEGIN
      v_dob := (NEW.raw_user_meta_data ->> 'date_of_birth')::date;
    EXCEPTION WHEN OTHERS THEN
      v_dob := NULL;
    END;
  ELSE
    v_dob := NULL;
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, phone, date_of_birth, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'phone'), ''),
    v_dob,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
    SET date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.profiles.date_of_birth);
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- END OF MIGRATION
-- ============================================================
