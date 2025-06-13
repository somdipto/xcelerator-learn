
-- Phase 1: Critical RLS Policy Implementation
-- Enable RLS on all tables that don't have it enabled

-- Ensure RLS is enabled on all critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Comprehensive RLS Policies for profiles table
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" 
ON public.profiles FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "profiles_insert_signup" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id AND role != 'admin')
WITH CHECK (auth.uid() = id AND role != 'admin');

CREATE POLICY "profiles_update_admin" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Study Materials RLS Policies
DROP POLICY IF EXISTS "Teachers can create materials" ON public.study_materials;
DROP POLICY IF EXISTS "Teachers can view their materials" ON public.study_materials;
DROP POLICY IF EXISTS "Teachers can update their materials" ON public.study_materials;
DROP POLICY IF EXISTS "Teachers can delete their materials" ON public.study_materials;
DROP POLICY IF EXISTS "Public materials are viewable by all" ON public.study_materials;

CREATE POLICY "study_materials_teacher_full_access" 
ON public.study_materials FOR ALL 
TO authenticated
USING (
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "study_materials_public_read" 
ON public.study_materials FOR SELECT 
TO authenticated
USING (is_public = true);

-- Subjects RLS Policies  
DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "All authenticated users can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Creators and admins can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Creators and admins can delete subjects" ON public.subjects;

CREATE POLICY "subjects_authenticated_read" 
ON public.subjects FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "subjects_teacher_create" 
ON public.subjects FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "subjects_creator_update" 
ON public.subjects FOR UPDATE 
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "subjects_creator_delete" 
ON public.subjects FOR DELETE 
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Chapters RLS Policies
DROP POLICY IF EXISTS "Subject creators can create chapters" ON public.chapters;
DROP POLICY IF EXISTS "All authenticated users can view chapters" ON public.chapters;
DROP POLICY IF EXISTS "Subject creators can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Subject creators can delete chapters" ON public.chapters;

CREATE POLICY "chapters_authenticated_read" 
ON public.chapters FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "chapters_subject_owner_manage" 
ON public.chapters FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE id = chapters.subject_id 
    AND (created_by = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE id = chapters.subject_id 
    AND (created_by = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

-- Audit Logs RLS Policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_admin_only" 
ON public.audit_logs FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Enhanced Security Functions
CREATE OR REPLACE FUNCTION public.validate_content_security(
  content_title text,
  content_description text DEFAULT NULL,
  content_url text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate title
  IF content_title IS NULL OR trim(content_title) = '' THEN
    RETURN false;
  END IF;
  
  -- Check for potentially malicious content in title/description
  IF content_title ~* '(script|javascript|vbscript|onload|onerror)' THEN
    RETURN false;
  END IF;
  
  IF content_description IS NOT NULL AND content_description ~* '(script|javascript|vbscript|onload|onerror)' THEN
    RETURN false;
  END IF;
  
  -- Validate URL if provided
  IF content_url IS NOT NULL AND NOT public.validate_url_secure(content_url) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Enhanced study material validation trigger
DROP TRIGGER IF EXISTS validate_study_material_trigger ON public.study_materials;

CREATE OR REPLACE FUNCTION public.validate_study_material_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate content security
  IF NOT public.validate_content_security(NEW.title, NEW.description, NEW.url) THEN
    RAISE EXCEPTION 'Content validation failed: potentially unsafe content detected';
  END IF;
  
  -- Ensure teacher role for material creation
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = NEW.teacher_id AND role IN ('teacher', 'admin')
    ) THEN
      RAISE EXCEPTION 'Access denied: Only teachers and admins can create study materials';
    END IF;
  END IF;
  
  -- Validate type-specific requirements
  IF NEW.type IN ('video', 'quiz') AND (NEW.url IS NULL OR trim(NEW.url) = '') THEN
    RAISE EXCEPTION 'URL is required for video and quiz content';
  END IF;
  
  -- Set security defaults
  IF NEW.is_public IS NULL THEN
    NEW.is_public = false; -- Default to private for security
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_study_material_secure_trigger
  BEFORE INSERT OR UPDATE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION public.validate_study_material_secure();

-- Enhanced user profile validation
CREATE OR REPLACE FUNCTION public.validate_profile_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate role assignment
  IF NEW.role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: must be student, teacher, or admin';
  END IF;
  
  -- Prevent unauthorized admin role assignment
  IF TG_OP = 'INSERT' AND NEW.role = 'admin' THEN
    RAISE EXCEPTION 'Admin role assignment requires manual intervention';
  END IF;
  
  -- Prevent role elevation without admin privileges
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Role changes require admin privileges';
    END IF;
  END IF;
  
  -- Sanitize name fields
  IF NEW.full_name IS NOT NULL THEN
    NEW.full_name = trim(substring(NEW.full_name, 1, 100));
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_security_trigger ON public.profiles;
CREATE TRIGGER validate_profile_security_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_security();

-- Security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    new_values, 
    created_at
  ) VALUES (
    auth.uid(), 
    'SECURITY_EVENT', 
    event_type, 
    event_details, 
    now()
  );
END;
$$;
