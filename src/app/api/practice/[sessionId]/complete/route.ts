import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { POINTS } from '@/lib/constants'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Calculate session stats
  const { data: attempts } = await supabase
    .from('question_attempts')
    .select('is_correct, time_spent_seconds')
    .eq('session_id', sessionId)

  if (!attempts) return NextResponse.json({ error: 'No attempts found' }, { status: 404 })

  const correctCount = attempts.filter((a) => a.is_correct).length
  const totalTime = attempts.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0)

  // Update session
  const { error } = await supabase
    .from('practice_sessions')
    .update({
      status: 'completed',
      correct_answers: correctCount,
      total_time_seconds: totalTime,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('student_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award session completion points
  await supabase.from('point_history').insert({
    student_id: user.id,
    action: 'session_complete',
    points: POINTS.session_complete,
    metadata: { session_id: sessionId, correct: correctCount, total: attempts.length },
  })

  // Update gamification
  await supabase.rpc('increment_gamification_counters' as never, {
    p_student_id: user.id,
    p_points: POINTS.session_complete,
    p_correct: 0,
  } as never)

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const { data: gam } = await supabase
    .from('student_gamification')
    .select('last_activity_date, current_streak_days, longest_streak_days')
    .eq('student_id', user.id)
    .single()

  if (gam) {
    let newStreak = 1
    if (gam.last_activity_date) {
      const lastDate = new Date(gam.last_activity_date)
      const todayDate = new Date(today)
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays === 0) {
        newStreak = gam.current_streak_days
      } else if (diffDays === 1) {
        newStreak = gam.current_streak_days + 1
      }
    }

    await supabase
      .from('student_gamification')
      .update({
        last_activity_date: today,
        current_streak_days: newStreak,
        longest_streak_days: Math.max(newStreak, gam.longest_streak_days),
        total_sessions_completed: gam.current_streak_days + 1, // Will be overwritten by RPC
      })
      .eq('student_id', user.id)
  }

  // Refresh materialized view for weakness detection
  try {
    await supabase.rpc('refresh_topic_performance' as never)
  } catch {
    // Non-critical, view will be refreshed next time
  }

  return NextResponse.json({
    correct: correctCount,
    total: attempts.length,
    accuracy: Math.round((correctCount / attempts.length) * 100),
    totalTimeSeconds: totalTime,
    pointsEarned: POINTS.session_complete,
  })
}
