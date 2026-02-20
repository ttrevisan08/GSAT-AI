CREATE TYPE point_action AS ENUM (
  'question_correct',
  'question_streak_5',
  'question_streak_10',
  'session_complete',
  'daily_login',
  'vocabulary_mastered',
  'weakness_improved'
);

CREATE TABLE public.student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_sessions_completed INTEGER DEFAULT 0,
  total_vocab_mastered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gamification_student ON public.student_gamification(student_id);
CREATE INDEX idx_gamification_points ON public.student_gamification(total_points DESC);

CREATE TABLE public.point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  action point_action NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_student ON public.point_history(student_id);
CREATE INDEX idx_points_student_date ON public.point_history(student_id, created_at);

CREATE TRIGGER gamification_updated_at
  BEFORE UPDATE ON public.student_gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
