-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- Students: own profile only
CREATE POLICY "Students can view own profile"
  ON public.students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update own profile"
  ON public.students FOR UPDATE USING (auth.uid() = id);

-- Questions: readable by all authenticated
CREATE POLICY "Authenticated users can read questions"
  ON public.questions FOR SELECT TO authenticated USING (is_active = TRUE);

-- Practice sessions: own data only
CREATE POLICY "Students manage own sessions"
  ON public.practice_sessions FOR ALL USING (auth.uid() = student_id);

-- Question attempts: own data only
CREATE POLICY "Students manage own attempts"
  ON public.question_attempts FOR ALL USING (auth.uid() = student_id);

-- Vocabulary words: readable by all authenticated
CREATE POLICY "Authenticated users can read vocabulary"
  ON public.vocabulary_words FOR SELECT TO authenticated USING (is_active = TRUE);

-- Student vocabulary: own data only
CREATE POLICY "Students manage own vocabulary progress"
  ON public.student_vocabulary FOR ALL USING (auth.uid() = student_id);

-- Gamification: read all (leaderboard), write own
CREATE POLICY "Students can read all gamification"
  ON public.student_gamification FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Students can update own gamification"
  ON public.student_gamification FOR UPDATE USING (auth.uid() = student_id);

-- Point history: own data only
CREATE POLICY "Students manage own points"
  ON public.point_history FOR ALL USING (auth.uid() = student_id);
