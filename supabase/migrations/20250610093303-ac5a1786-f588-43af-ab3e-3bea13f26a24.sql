
-- Phase 1: Critical RLS Policy Fixes

-- First, clean up duplicate and conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "Users can view own profile or admins can view all" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "System can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- Add RLS policies for study_materials table
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their own materials" 
ON public.study_materials FOR ALL 
USING (
  auth.uid() = teacher_id OR 
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() = teacher_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Public materials are viewable by all" 
ON public.study_materials FOR SELECT 
USING (is_public = true);

-- Add RLS policies for subjects table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage subjects they created" 
ON public.subjects FOR ALL 
USING (
  auth.uid() = created_by OR 
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() = created_by OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "All authenticated users can view subjects" 
ON public.subjects FOR SELECT 
TO authenticated
USING (true);

-- Add RLS policies for chapters table
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage chapters for their subjects" 
ON public.chapters FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE subjects.id = chapters.subject_id 
    AND (subjects.created_by = auth.uid() OR public.get_current_user_role() = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE subjects.id = chapters.subject_id 
    AND (subjects.created_by = auth.uid() OR public.get_current_user_role() = 'admin')
  )
);

CREATE POLICY "All authenticated users can view chapters" 
ON public.chapters FOR SELECT 
TO authenticated
USING (true);

-- Add validation function for file uploads
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  file_path text,
  file_size bigint,
  mime_type text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check file size (max 50MB)
  IF file_size > 52428800 THEN
    RETURN false;
  END IF;
  
  -- Check allowed MIME types
  IF mime_type NOT IN (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add audit logging table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Add audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_study_materials_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_subjects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
