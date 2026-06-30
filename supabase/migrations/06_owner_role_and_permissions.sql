-- 1. Update is_admin helper to support both admin and owner roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger to enforce owner-only role promotions and demotions
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS trigger AS $$
BEGIN
  -- Check if the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Verify if the current authenticated user has the 'owner' role
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    ) THEN
      RAISE EXCEPTION 'Access Denied: Only platform owners can promote or demote user roles.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to profiles table
DROP TRIGGER IF EXISTS trg_check_profile_role_update ON public.profiles;
CREATE TRIGGER trg_check_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_update();
