CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE session_type AS ENUM ('topic_practice', 'weakness_drill', 'full_section', 'ai_generated');

CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  section sat_section NOT NULL,
  topic sat_topic,
  session_type session_type NOT NULL DEFAULT 'topic_practice',
  status session_status NOT NULL DEFAULT 'in_progress',
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_student ON public.practice_sessions(student_id);
CREATE INDEX idx_sessions_student_status ON public.practice_sessions(student_id, status);

CREATE TABLE public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  selected_answer TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_session ON public.question_attempts(session_id);
CREATE INDEX idx_attempts_student ON public.question_attempts(student_id);
CREATE INDEX idx_attempts_student_question ON public.question_attempts(student_id, question_id);

-- Materialized view for topic performance (powers Feature 3)
CREATE MATERIALIZED VIEW public.student_topic_performance AS
SELECT
  qa.student_id,
  q.section,
  q.topic,
  COUNT(*) AS total_attempts,
  SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) AS correct_attempts,
  ROUND(
    100.0 * SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    1
  ) AS accuracy_pct,
  AVG(qa.time_spent_seconds) AS avg_time_seconds,
  MAX(qa.created_at) AS last_attempt_at
FROM public.question_attempts qa
JOIN public.questions q ON qa.question_id = q.id
GROUP BY qa.student_id, q.section, q.topic;

CREATE UNIQUE INDEX idx_topic_performance_student_topic
  ON public.student_topic_performance(student_id, section, topic);

CREATE OR REPLACE FUNCTION refresh_topic_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.student_topic_performance;
END;
$$ LANGUAGE plpgsql;
