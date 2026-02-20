CREATE TYPE vocab_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE mastery_level AS ENUM ('new', 'learning', 'reviewing', 'mastered');

CREATE TABLE public.vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  part_of_speech TEXT,
  example_sentence TEXT,
  pronunciation_ipa TEXT,
  difficulty vocab_difficulty NOT NULL DEFAULT 'intermediate',
  sat_frequency INTEGER DEFAULT 0,
  synonyms TEXT[] DEFAULT '{}',
  antonyms TEXT[] DEFAULT '{}',
  portuguese_translation TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vocab_difficulty ON public.vocabulary_words(difficulty);
CREATE INDEX idx_vocab_frequency ON public.vocabulary_words(sat_frequency DESC);

CREATE TABLE public.student_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  mastery mastery_level NOT NULL DEFAULT 'new',
  times_seen INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  current_interval_hours INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, word_id)
);

CREATE INDEX idx_student_vocab_student ON public.student_vocabulary(student_id);
CREATE INDEX idx_student_vocab_review ON public.student_vocabulary(student_id, next_review_at);
CREATE INDEX idx_student_vocab_mastery ON public.student_vocabulary(student_id, mastery);

CREATE TRIGGER student_vocabulary_updated_at
  BEFORE UPDATE ON public.student_vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
