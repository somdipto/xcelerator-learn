
-- First, let's check what policies already exist and drop them to ensure a clean state
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Creators can update subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Creators can delete subjects" ON public.subjects;
    DROP POLICY IF EXISTS "Teachers can manage their materials" ON public.study_materials;
    DROP POLICY IF EXISTS "Public materials viewable by all" ON public.study_materials;
    DROP POLICY IF EXISTS "Anyone can view chapters" ON public.chapters;
    DROP POLICY IF EXISTS "Subject creators can manage chapters" ON public.chapters;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create RLS policies for subjects
CREATE POLICY "Anyone can view subjects" 
ON public.subjects FOR SELECT 
TO authenticated
USING (true);

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

CREATE POLICY "Creators can update subjects" 
ON public.subjects FOR UPDATE 
TO authenticated
USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Creators can delete subjects" 
ON public.subjects FOR DELETE 
TO authenticated
USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'admin'
);

-- Create RLS policies for chapters
CREATE POLICY "Anyone can view chapters" 
ON public.chapters FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Subject creators can manage chapters" 
ON public.chapters FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE id = chapters.subject_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.subjects 
    WHERE id = chapters.subject_id 
    AND (created_by = auth.uid() OR public.get_current_user_role() = 'admin')
  )
);

-- Create RLS policies for study materials
CREATE POLICY "Teachers can manage their materials" 
ON public.study_materials FOR ALL 
TO authenticated
USING (
  auth.uid() = teacher_id OR
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() = teacher_id OR
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Public materials viewable by all" 
ON public.study_materials FOR SELECT 
TO authenticated
USING (is_public = true);

-- Create RLS policy for audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Create or replace the user signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure validation triggers are connected
DROP TRIGGER IF EXISTS validate_study_material_secure_trigger ON public.study_materials;
DROP TRIGGER IF EXISTS validate_profile_security_trigger ON public.profiles;

CREATE TRIGGER validate_study_material_secure_trigger
  BEFORE INSERT OR UPDATE ON public.study_materials
  FOR EACH ROW EXECUTE FUNCTION public.validate_study_material_secure();

CREATE TRIGGER validate_profile_security_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_security();
