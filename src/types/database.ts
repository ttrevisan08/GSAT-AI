export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          email: string
          full_name: string
          target_score: number
          current_estimated_score: number | null
          sat_exam_date: string | null
          stripe_customer_id: string | null
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_expires_at: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          target_score?: number
          current_estimated_score?: number | null
          sat_exam_date?: string | null
          stripe_customer_id?: string | null
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_expires_at?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      questions: {
        Row: {
          id: string
          section: 'math' | 'reading_writing'
          topic: string
          difficulty: 'easy' | 'medium' | 'hard'
          source: 'bluebook' | 'cit' | 'internet' | 'ai_generated' | 'custom'
          stem: string
          options: { key: string; text: string }[]
          correct_answer: string
          explanation: string | null
          passage: string | null
          ai_model: string | null
          ai_prompt_context: string | null
          parent_question_id: string | null
          tags: string[]
          is_active: boolean
          times_served: number
          times_correct: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: 'math' | 'reading_writing'
          topic: string
          difficulty?: 'easy' | 'medium' | 'hard'
          source?: 'bluebook' | 'cit' | 'internet' | 'ai_generated' | 'custom'
          stem: string
          options: { key: string; text: string }[]
          correct_answer: string
          explanation?: string | null
          passage?: string | null
          ai_model?: string | null
          ai_prompt_context?: string | null
          parent_question_id?: string | null
          tags?: string[]
          is_active?: boolean
          times_served?: number
          times_correct?: number
        }
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      practice_sessions: {
        Row: {
          id: string
          student_id: string
          section: 'math' | 'reading_writing'
          topic: string | null
          session_type: 'topic_practice' | 'weakness_drill' | 'full_section' | 'ai_generated'
          status: 'in_progress' | 'completed' | 'abandoned'
          total_questions: number
          correct_answers: number
          total_time_seconds: number
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          section: 'math' | 'reading_writing'
          topic?: string | null
          session_type?: 'topic_practice' | 'weakness_drill' | 'full_section' | 'ai_generated'
          status?: 'in_progress' | 'completed' | 'abandoned'
          total_questions: number
          correct_answers?: number
          total_time_seconds?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['practice_sessions']['Insert']>
      }
      question_attempts: {
        Row: {
          id: string
          session_id: string
          student_id: string
          question_id: string
          selected_answer: string | null
          is_correct: boolean | null
          time_spent_seconds: number | null
          sequence_number: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          question_id: string
          selected_answer?: string | null
          is_correct?: boolean | null
          time_spent_seconds?: number | null
          sequence_number: number
        }
        Update: Partial<Database['public']['Tables']['question_attempts']['Insert']>
      }
      vocabulary_words: {
        Row: {
          id: string
          word: string
          definition: string
          part_of_speech: string | null
          example_sentence: string | null
          pronunciation_ipa: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          sat_frequency: number
          synonyms: string[]
          antonyms: string[]
          portuguese_translation: string | null
          tags: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          definition: string
          part_of_speech?: string | null
          example_sentence?: string | null
          pronunciation_ipa?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          sat_frequency?: number
          synonyms?: string[]
          antonyms?: string[]
          portuguese_translation?: string | null
          tags?: string[]
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['vocabulary_words']['Insert']>
      }
      student_vocabulary: {
        Row: {
          id: string
          student_id: string
          word_id: string
          mastery: 'new' | 'learning' | 'reviewing' | 'mastered'
          times_seen: number
          times_correct: number
          last_reviewed_at: string | null
          next_review_at: string | null
          current_interval_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          word_id: string
          mastery?: 'new' | 'learning' | 'reviewing' | 'mastered'
          times_seen?: number
          times_correct?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          current_interval_hours?: number
        }
        Update: Partial<Database['public']['Tables']['student_vocabulary']['Insert']>
      }
      student_gamification: {
        Row: {
          id: string
          student_id: string
          total_points: number
          current_streak_days: number
          longest_streak_days: number
          last_activity_date: string | null
          total_questions_answered: number
          total_correct_answers: number
          total_sessions_completed: number
          total_vocab_mastered: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_points?: number
          current_streak_days?: number
          longest_streak_days?: number
          last_activity_date?: string | null
          total_questions_answered?: number
          total_correct_answers?: number
          total_sessions_completed?: number
          total_vocab_mastered?: number
        }
        Update: Partial<Database['public']['Tables']['student_gamification']['Insert']>
      }
      point_history: {
        Row: {
          id: string
          student_id: string
          action: string
          points: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          action: string
          points: number
          metadata?: Json
        }
        Update: Partial<Database['public']['Tables']['point_history']['Insert']>
      }
    }
    Views: {
      student_topic_performance: {
        Row: {
          student_id: string
          section: 'math' | 'reading_writing'
          topic: string
          total_attempts: number
          correct_attempts: number
          accuracy_pct: number
          avg_time_seconds: number
          last_attempt_at: string
        }
      }
    }
  }
}

export type Student = Database['public']['Tables']['students']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type PracticeSession = Database['public']['Tables']['practice_sessions']['Row']
export type QuestionAttempt = Database['public']['Tables']['question_attempts']['Row']
export type VocabularyWord = Database['public']['Tables']['vocabulary_words']['Row']
export type StudentVocabulary = Database['public']['Tables']['student_vocabulary']['Row']
export type StudentGamification = Database['public']['Tables']['student_gamification']['Row']
export type PointHistory = Database['public']['Tables']['point_history']['Row']
export type TopicPerformance = Database['public']['Views']['student_topic_performance']['Row']
