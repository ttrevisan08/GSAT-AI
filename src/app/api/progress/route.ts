import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Overall stats from gamification
  const { data: gam } = await supabase
    .from('student_gamification')
    .select('*')
    .eq('student_id', user.id)
    .single()

  // Recent sessions
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  // Vocab progress
  const { data: vocabStats } = await supabase
    .from('student_vocabulary')
    .select('mastery')
    .eq('student_id', user.id)

  const vocabBreakdown = {
    new: 0,
    learning: 0,
    reviewing: 0,
    mastered: 0,
  }
  vocabStats?.forEach((v: { mastery: keyof typeof vocabBreakdown }) => {
    vocabBreakdown[v.mastery]++
  })

  // Calculate estimated score
  const totalAnswered = gam?.total_questions_answered || 0
  const totalCorrect = gam?.total_correct_answers || 0
  const overallAccuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0
  // Simple estimate: 400 base + accuracy * 1200 (max 1600)
  const estimatedScore = Math.round(400 + overallAccuracy * 1200)

  return NextResponse.json({
    gamification: gam,
    recentSessions: sessions || [],
    vocabularyProgress: vocabBreakdown,
    stats: {
      totalQuestionsAnswered: totalAnswered,
      totalCorrect,
      overallAccuracy: Math.round(overallAccuracy * 100),
      estimatedScore: Math.min(estimatedScore, 1600),
      totalSessions: gam?.total_sessions_completed || 0,
      currentStreak: gam?.current_streak_days || 0,
      totalPoints: gam?.total_points || 0,
    },
  })
}
