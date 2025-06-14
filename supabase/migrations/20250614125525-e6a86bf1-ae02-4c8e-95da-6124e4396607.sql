
-- First, let's add a unique constraint to prevent duplicate subjects for the same grade
ALTER TABLE public.subjects ADD CONSTRAINT unique_subject_grade UNIQUE (name, grade);

-- Add a unique constraint to prevent duplicate chapters for the same subject
ALTER TABLE public.chapters ADD CONSTRAINT unique_chapter_subject UNIQUE (name, subject_id);

-- Now insert subjects safely
INSERT INTO public.subjects (name, grade, description, icon, color) VALUES
('Mathematics', 8, 'Mathematics curriculum for Class 8', '🧮', '#2979FF'),
('Mathematics', 9, 'Mathematics curriculum for Class 9', '🧮', '#2979FF'),
('Mathematics', 10, 'Mathematics curriculum for Class 10', '🧮', '#2979FF'),
('Science', 8, 'Science curriculum for Class 8', '🔬', '#00E676'),
('Science', 9, 'Science curriculum for Class 9', '🔬', '#00E676'),
('Science', 10, 'Science curriculum for Class 10', '🔬', '#00E676'),
('Social Science', 8, 'Social Science curriculum for Class 8', '🌍', '#FF7043'),
('Social Science', 9, 'Social Science curriculum for Class 9', '🌍', '#FF7043'),
('Social Science', 10, 'Social Science curriculum for Class 10', '🌍', '#FF7043')
ON CONFLICT (name, grade) DO NOTHING;

-- Insert Mathematics Class 8 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Mathematics Class 8'
FROM (VALUES
  ('Chapter 1: Rational Numbers'),
  ('Chapter 2: Linear Equations in One Variable'),
  ('Chapter 3: Understanding Quadrilaterals'),
  ('Chapter 4: Practical Geometry'),
  ('Chapter 5: Data Handling'),
  ('Chapter 6: Squares and Square Roots'),
  ('Chapter 7: Cubes and Cube Roots'),
  ('Chapter 8: Comparing Quantities'),
  ('Chapter 9: Algebraic Expressions and Identities'),
  ('Chapter 10: Visualizing Shapes'),
  ('Chapter 11: Mensuration'),
  ('Chapter 12: Exponents and Powers'),
  ('Chapter 13: Direct and Indirect Proportions'),
  ('Chapter 14: Factorization'),
  ('Chapter 15: Introduction to Graphs'),
  ('Chapter 16: Playing with Numbers')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Mathematics' AND s.grade = 8
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Mathematics Class 9 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Mathematics Class 9'
FROM (VALUES
  ('Chapter 1: Number System'),
  ('Chapter 2: Polynomials'),
  ('Chapter 3: Co-ordinate Geometry'),
  ('Chapter 4: Linear Equations in two variables'),
  ('Chapter 5: Introduction to Euclid''s Geometry'),
  ('Chapter 6: Lines and Angles'),
  ('Chapter 7: TRIANGLES'),
  ('Chapter 8: Quadrilaterals'),
  ('Chapter 9: Circles'),
  ('Chapter 10: HERON''S FORMULA'),
  ('Chapter 11: SURFACE AREAS AND VOLUMES'),
  ('Chapter 12: Statistics')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Mathematics' AND s.grade = 9
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Mathematics Class 10 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Mathematics Class 10'
FROM (VALUES
  ('Chapter 1: Real Numbers'),
  ('Chapter 2: Polynomials'),
  ('Chapter 3: Pair of Linear Equations in two variables'),
  ('Chapter 4: Quadratic Equations'),
  ('Chapter 5: Arithmetic Progressions'),
  ('Chapter 6: Triangles'),
  ('Chapter 7: Coordinate Geometry'),
  ('Chapter 8: INTRODUCTION TO TRIGONOMETRY'),
  ('Chapter 9: SOME APPLICATIONS OF TRIGONOMETRY'),
  ('Chapter 10: Circles'),
  ('Chapter 11: AREAS RELATED TO CIRCLES'),
  ('Chapter 12: SURFACE AREAS AND VOLUMES'),
  ('Chapter 13: STATISTICS'),
  ('Chapter 14: PROBABILITY')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Mathematics' AND s.grade = 10
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Science Class 8 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Science Class 8'
FROM (VALUES
  ('Chapter 1: Force & Pressure'),
  ('Chapter 2: Friction'),
  ('Chapter 3: Coal & Petroleum'),
  ('Chapter 4: Synthetic Fibers & Plastics'),
  ('Chapter 5: Sounds'),
  ('Chapter 6: Materials: Metals and Non Metals'),
  ('Chapter 7: Light'),
  ('Chapter 8: Chemical Effects of Electrical Current'),
  ('Chapter 9: Some Natural Phenomena'),
  ('Chapter 10: Combustion and Flames'),
  ('Chapter 11: Stars and Solar System'),
  ('Chapter 12: Cell - Structure and Function'),
  ('Chapter 13: Microorganisms: Friends and Foes'),
  ('Chapter 14: Crop Production and Management'),
  ('Chapter 15: Reproduction in Animals'),
  ('Chapter 16: Reaching the age of Adolescence'),
  ('Chapter 17: Conservation of Plants and Animals'),
  ('Chapter 18: Pollution of Air and Water')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Science' AND s.grade = 8
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Science Class 9 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Science Class 9'
FROM (VALUES
  ('Chapter 1: MATTER IN OUR SURROUNDINGS'),
  ('Chapter 2: IS MATTER AROUND US PURE?'),
  ('Chapter 3: ATOMS AND MOLECULES'),
  ('Chapter 4: STRUCTURE OF THE ATOM'),
  ('Chapter 5: THE FUNDAMENTAL UNIT OF LIFE'),
  ('Chapter 6: TISSUES'),
  ('Chapter 7: MOTIONS'),
  ('Chapter 8: FORCE AND LAWS OF MOTION'),
  ('Chapter 9: GRAVITATION'),
  ('Chapter 10: WORK AND ENERGY'),
  ('Chapter 11: SOUND'),
  ('Chapter 12: IMPROVEMENT IN FOOD RESOURCES')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Science' AND s.grade = 9
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Science Class 10 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Science Class 10'
FROM (VALUES
  ('Chapter 1: Light - Reflection and Refraction'),
  ('Chapter 2: The Human Eye and the Colourful World'),
  ('Chapter 3: Electricity'),
  ('Chapter 4: Magnetic Effects of Electric Current'),
  ('Chapter 5: Life Processes'),
  ('Chapter 6: Control and Coordination'),
  ('Chapter 7: How do Organisms Reproduce?'),
  ('Chapter 8: Heredity'),
  ('Chapter 9: Chemical Reactions and Equations'),
  ('Chapter 10: Acids, Bases and Salts'),
  ('Chapter 11: Metals and Non-metals'),
  ('Chapter 12: Carbon and Its Compounds')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Science' AND s.grade = 10
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Social Science Class 8 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Social Science Class 8'
FROM (VALUES
  ('Chapter 1: Resources'),
  ('Chapter 2: Land, Soil, Water, Natural Vegetation and Wildlife Resources'),
  ('Chapter 3: Mineral and Power Resources'),
  ('Chapter 4: Agriculture'),
  ('Chapter 5: Industries'),
  ('Chapter 6: Human Resources'),
  ('Chapter 7: How, When and Where'),
  ('Chapter 8: From Trade to Territory'),
  ('Chapter 9: Ruling the Countryside'),
  ('Chapter 10: Tribals, Dikus and the Vision of a Golden Age'),
  ('Chapter 11: When People Rebel 1857 and After'),
  ('Chapter 12: Weavers, Iron Smelters and Factory Owners'),
  ('Chapter 13: Civilizing the "Native", Educating the Nation'),
  ('Chapter 14: Women, Caste and Reform'),
  ('Chapter 15: The Making of the National Movement 1870s-1947'),
  ('Chapter 16: India After Independence'),
  ('Chapter 17: The Indian Constitution and Secularism'),
  ('Chapter 18: Parliament and The Making of Laws'),
  ('Chapter 19: The Judiciary'),
  ('Chapter 20: Social Justice and The Marginalised'),
  ('Chapter 21: Economic Presence of the Government')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Social Science' AND s.grade = 8
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Social Science Class 9 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Social Science Class 9'
FROM (VALUES
  ('Chapter 1: India - Size and Location'),
  ('Chapter 2: Physical Features of India'),
  ('Chapter 3: Drainage'),
  ('Chapter 4: Climate'),
  ('Chapter 5: Natural Vegetation and Wildlife'),
  ('Chapter 6: Population'),
  ('Chapter 7: The French Revolution'),
  ('Chapter 8: Socialism in Europe and the Russian Revolution'),
  ('Chapter 9: Nazism and the Rise of Hitler'),
  ('Chapter 10: Forest Society and Colonialism'),
  ('Chapter 11: Pastoralists in the Modern World'),
  ('Chapter 12: WHAT IS DEMOCRACY? WHY DEMOCRACY?'),
  ('Chapter 13: CONSTITUTIONAL DESIGN'),
  ('Chapter 14: ELECTORAL POLITICS'),
  ('Chapter 15: WORKING OF INSTITUTIONS'),
  ('Chapter 16: Democratic Rights'),
  ('Chapter 17: The Story of Village Palampur'),
  ('Chapter 18: People as Resource'),
  ('Chapter 19: Poverty as a Challenge'),
  ('Chapter 20: Food Security in India')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Social Science' AND s.grade = 9
ON CONFLICT (name, subject_id) DO NOTHING;

-- Insert Social Science Class 10 chapters
INSERT INTO public.chapters (name, subject_id, order_index, description) 
SELECT 
  chapter_name,
  s.id,
  ROW_NUMBER() OVER (ORDER BY chapter_name),
  'Chapter for Social Science Class 10'
FROM (VALUES
  ('Chapter 1: Development'),
  ('Chapter 2: Resources and Development'),
  ('Chapter 3: The Rise of Nationalism in Europe'),
  ('Chapter 4: Power Sharing'),
  ('Chapter 5: Federalism'),
  ('Chapter 6: Democracy and Diversity'),
  ('Chapter 7: Popular Struggles and Movements'),
  ('Chapter 8: Challenges to Democracy')
) AS chapters(chapter_name)
CROSS JOIN subjects s
WHERE s.name = 'Social Science' AND s.grade = 10
ON CONFLICT (name, subject_id) DO NOTHING;
