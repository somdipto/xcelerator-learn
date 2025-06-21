-- Create Core Database Tables for K12 Learning Platform
-- This migration creates all the fundamental tables needed for the application

-- 1. Create profiles table (user information)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create subjects table (curriculum subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade integer NOT NULL CHECK (grade >= 1 AND grade <= 12),
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, grade, created_by)
);

-- 3. Create chapters table (subject chapters)
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, order_index)
);

-- 4. Create study_materials table (learning content)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('textbook', 'video', 'summary', 'ppt', 'quiz', 'pdf', 'document')),
  url text, -- Google Drive URL or external link
  file_path text, -- Local file path (if uploaded)
  grade integer CHECK (grade >= 1 AND grade <= 12),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  file_size bigint,
  mime_type text,
  tags text[], -- Array of tags for better organization
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_subjects_grade ON public.subjects(grade);
CREATE INDEX IF NOT EXISTS idx_subjects_created_by ON public.subjects(created_by);

CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON public.chapters(subject_id, order_index);

CREATE INDEX IF NOT EXISTS idx_study_materials_subject_id ON public.study_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_chapter_id ON public.study_materials(chapter_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_teacher_id ON public.study_materials(teacher_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_grade ON public.study_materials(grade);
CREATE INDEX IF NOT EXISTS idx_study_materials_type ON public.study_materials(type);
CREATE INDEX IF NOT EXISTS idx_study_materials_public ON public.study_materials(is_public);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at 
  BEFORE UPDATE ON public.subjects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at 
  BEFORE UPDATE ON public.chapters 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at 
  BEFORE UPDATE ON public.study_materials 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Create validation functions
CREATE OR REPLACE FUNCTION public.validate_google_drive_url(url text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if URL is a valid Google Drive link
  IF url IS NULL OR url = '' THEN
    RETURN false;
  END IF;
  
  -- Allow Google Drive share URLs and embed URLs
  IF url ~* '^https://drive\.google\.com/(file/d/|open\?id=)' THEN
    RETURN true;
  END IF;
  
  -- Allow other valid HTTP/HTTPS URLs
  IF url ~* '^https?://.+' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_profile_security(profile_data public.profiles)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate email format
  IF profile_data.email IS NULL OR profile_data.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate role
  IF profile_data.role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_study_material_secure(material_data public.study_materials)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate URL if provided
  IF material_data.url IS NOT NULL AND NOT public.validate_google_drive_url(material_data.url) THEN
    RAISE EXCEPTION 'Invalid URL format. Please provide a valid Google Drive link or HTTP/HTTPS URL';
  END IF;
  
  -- Validate file size if provided
  IF material_data.file_size IS NOT NULL AND material_data.file_size > 52428800 THEN -- 50MB
    RAISE EXCEPTION 'File size exceeds maximum limit of 50MB';
  END IF;
  
  -- Validate grade if provided
  IF material_data.grade IS NOT NULL AND (material_data.grade < 1 OR material_data.grade > 12) THEN
    RAISE EXCEPTION 'Grade must be between 1 and 12';
  END IF;
  
  RETURN true;
END;
$$;

-- 9. Enable Row Level Security (will be configured in subsequent migrations)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- 10. Insert default admin user (optional - for development)
-- This will be handled by the application signup process