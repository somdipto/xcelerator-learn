
-- Phase 1: Critical Database Security Fixes (Fixed version)

-- First, let's properly clean up existing policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
    DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
    
    -- Drop study_materials policies
    DROP POLICY IF EXISTS "Teachers can create materials" ON public.study_materials;
    DROP POLICY IF EXISTS "Teachers can view their materials" ON public.study_materials;
    DROP POLICY IF EXISTS "Teachers can update their materials" ON public.study_materials;
    DROP POLICY IF EXISTS "Teachers can delete their materials" ON public.study_materials;
    DROP POLICY IF EXISTS "Teachers can manage their own materials" ON public.study_materials;
    DROP POLICY IF EXISTS "Public materials are viewable by all" ON public.study_materials;
    
    -- Drop subjects policies
    DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
    DROP POLICY IF EXISTS "All authenticated users can view subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Creators and admins can update subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Creators and admins can delete subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Teachers can manage subjects they created" ON public.subjects;
    
    -- Drop chapters policies
    DROP POLICY IF EXISTS "Subject creators can create chapters" ON public.chapters;
    DROP POLICY IF EXISTS "All authenticated users can view chapters" ON public.chapters;
    DROP POLICY IF EXISTS "Subject creators can update chapters" ON public.chapters;
    DROP POLICY IF EXISTS "Subject creators can delete chapters" ON public.chapters;
    DROP POLICY IF EXISTS "Teachers can manage chapters for their subjects" ON public.chapters;
END $$;

-- Create comprehensive and secure RLS policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role != 'admin');

CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Allow profile creation during signup" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create secure study_materials policies
CREATE POLICY "Teachers can create materials" 
ON public.study_materials FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = teacher_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Teachers can view their materials" 
ON public.study_materials FOR SELECT 
TO authenticated
USING (
  auth.uid() = teacher_id OR
  (is_public = true) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Teachers can update their materials" 
ON public.study_materials FOR UPDATE 
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

CREATE POLICY "Teachers can delete their materials" 
ON public.study_materials FOR DELETE 
TO authenticated
USING (
  auth.uid() = teacher_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create secure subjects policies
CREATE POLICY "Teachers can create subjects" 
ON public.subjects FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "All authenticated users can view subjects" 
ON public.subjects FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Creators and admins can update subjects" 
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

CREATE POLICY "Creators and admins can delete subjects" 
ON public.subjects FOR DELETE 
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create secure chapters policies
CREATE POLICY "Subject creators can create chapters" 
ON public.chapters FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE id = chapters.subject_id 
    AND (created_by = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

CREATE POLICY "All authenticated users can view chapters" 
ON public.chapters FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Subject creators can update chapters" 
ON public.chapters FOR UPDATE 
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

CREATE POLICY "Subject creators can delete chapters" 
ON public.chapters FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE id = chapters.subject_id 
    AND (created_by = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

-- Add enhanced validation functions with security improvements
CREATE OR REPLACE FUNCTION public.validate_file_upload_secure(
  file_path text,
  file_size bigint,
  mime_type text,
  user_role text DEFAULT 'student'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_size_bytes bigint;
  allowed_types text[];
BEGIN
  -- Set size limits based on user role
  CASE user_role
    WHEN 'teacher', 'admin' THEN
      max_size_bytes := 104857600; -- 100MB for teachers/admins
    ELSE
      max_size_bytes := 52428800;  -- 50MB for students
  END CASE;
  
  -- Check file size
  IF file_size > max_size_bytes THEN
    RETURN false;
  END IF;
  
  -- Define allowed MIME types
  allowed_types := ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  -- Check MIME type
  IF mime_type != ANY(allowed_types) THEN
    RETURN false;
  END IF;
  
  -- Additional security: check file path doesn't contain dangerous patterns
  IF file_path ~ '\.\.|\/\.|\.exe$|\.bat$|\.cmd$|\.com$|\.scr$|\.vbs$|\.js$' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{"valid": false, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for digit
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Check against common passwords (basic check)
  IF password IN ('password', '123456', '123456789', 'qwerty', 'abc123', 'password123') THEN
    errors := array_append(errors, 'Password is too common');
  END IF;
  
  IF array_length(errors, 1) IS NULL THEN
    result := '{"valid": true, "errors": []}'::jsonb;
  ELSE
    result := jsonb_build_object('valid', false, 'errors', errors);
  END IF;
  
  RETURN result;
END;
$$;

-- Add secure URL validation function
CREATE OR REPLACE FUNCTION public.validate_url_secure(url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for null or empty
  IF url IS NULL OR trim(url) = '' THEN
    RETURN false;
  END IF;
  
  -- Check length (prevent extremely long URLs)
  IF length(url) > 2048 THEN
    RETURN false;
  END IF;
  
  -- Allow only safe protocols
  IF url !~ '^https?://' AND url !~ '^ftp://' THEN
    RETURN false;
  END IF;
  
  -- Block dangerous protocols and patterns
  IF url ~* '(javascript:|data:|vbscript:|file:|mailto:|tel:)' THEN
    RETURN false;
  END IF;
  
  -- Block localhost and private IP ranges in production
  IF url ~* '(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Enhanced audit trigger with security focus
CREATE OR REPLACE FUNCTION public.audit_trigger_function_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
  excluded_columns text[] := ARRAY['password', 'password_hash', 'token', 'secret'];
BEGIN
  -- Remove sensitive fields from audit logs
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    -- Remove sensitive columns
    FOR i IN 1 .. array_length(excluded_columns, 1) LOOP
      old_data = old_data - excluded_columns[i];
    END LOOP;
    
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, created_at)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, old_data, now());
    RETURN OLD;
    
  ELSIF TG_OP = 'UPDATE' THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    
    -- Remove sensitive columns
    FOR i IN 1 .. array_length(excluded_columns, 1) LOOP
      old_data = old_data - excluded_columns[i];
      new_data = new_data - excluded_columns[i];
    END LOOP;
    
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, created_at)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, old_data, new_data, now());
    RETURN NEW;
    
  ELSIF TG_OP = 'INSERT' THEN
    new_data = to_jsonb(NEW);
    
    -- Remove sensitive columns
    FOR i IN 1 .. array_length(excluded_columns, 1) LOOP
      new_data = new_data - excluded_columns[i];
    END LOOP;
    
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values, created_at)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, new_data, now());
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Update audit triggers to use secure function
DROP TRIGGER IF EXISTS audit_study_materials_trigger ON public.study_materials;
DROP TRIGGER IF EXISTS audit_subjects_trigger ON public.subjects;
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
DROP TRIGGER IF EXISTS audit_study_materials_trigger_secure ON public.study_materials;
DROP TRIGGER IF EXISTS audit_subjects_trigger_secure ON public.subjects;
DROP TRIGGER IF EXISTS audit_profiles_trigger_secure ON public.profiles;

CREATE TRIGGER audit_study_materials_trigger_secure
  AFTER INSERT OR UPDATE OR DELETE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function_secure();

CREATE TRIGGER audit_subjects_trigger_secure
  AFTER INSERT OR UPDATE OR DELETE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function_secure();

CREATE TRIGGER audit_profiles_trigger_secure
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function_secure();

-- Add trigger to validate study material URLs
DROP TRIGGER IF EXISTS validate_study_material_trigger ON public.study_materials;

CREATE OR REPLACE FUNCTION public.validate_study_material_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate URL if provided
  IF NEW.url IS NOT NULL AND NOT public.validate_url_secure(NEW.url) THEN
    RAISE EXCEPTION 'Invalid or unsafe URL provided';
  END IF;
  
  -- Ensure teacher role for material creation
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = NEW.teacher_id AND role IN ('teacher', 'admin')
    ) THEN
      RAISE EXCEPTION 'Only teachers and admins can create study materials';
    END IF;
  END IF;
  
  -- Validate required fields
  IF NEW.title IS NULL OR trim(NEW.title) = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF NEW.type IS NULL OR trim(NEW.type) = '' THEN
    RAISE EXCEPTION 'Type is required';
  END IF;
  
  -- Validate type-specific requirements
  IF NEW.type IN ('video', 'quiz') AND (NEW.url IS NULL OR trim(NEW.url) = '') THEN
    RAISE EXCEPTION 'URL is required for video and quiz content';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_study_material_trigger
  BEFORE INSERT OR UPDATE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION public.validate_study_material_data();
