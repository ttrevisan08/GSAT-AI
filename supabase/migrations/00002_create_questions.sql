CREATE TYPE sat_section AS ENUM ('math', 'reading_writing');

CREATE TYPE sat_topic AS ENUM (
  'algebra_linear_equations',
  'algebra_systems',
  'algebra_inequalities',
  'advanced_math_quadratics',
  'advanced_math_polynomials',
  'advanced_math_exponential',
  'advanced_math_radicals',
  'advanced_math_rational',
  'problem_solving_ratios',
  'problem_solving_percentages',
  'problem_solving_units',
  'problem_solving_scatterplots',
  'problem_solving_probability',
  'problem_solving_statistics',
  'geometry_lines_angles',
  'geometry_triangles',
  'geometry_circles',
  'geometry_volume_area',
  'trigonometry',
  'rw_central_ideas',
  'rw_command_of_evidence',
  'rw_inferences',
  'rw_words_in_context',
  'rw_text_structure',
  'rw_cross_text_connections',
  'rw_rhetorical_synthesis',
  'rw_standard_english_conventions',
  'rw_boundaries',
  'rw_form_structure_sense',
  'rw_transitions'
);

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_source AS ENUM ('bluebook', 'cit', 'internet', 'ai_generated', 'custom');

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section sat_section NOT NULL,
  topic sat_topic NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  source question_source NOT NULL DEFAULT 'custom',
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  passage TEXT,
  ai_model TEXT,
  ai_prompt_context TEXT,
  parent_question_id UUID REFERENCES public.questions(id),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  times_served INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_section ON public.questions(section);
CREATE INDEX idx_questions_topic ON public.questions(topic);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_section_topic ON public.questions(section, topic);
CREATE INDEX idx_questions_active ON public.questions(is_active) WHERE is_active = TRUE;

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
