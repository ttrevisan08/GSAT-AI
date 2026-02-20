import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const { data, error } = await supabase
    .from('student_gamification')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries = data || []
  const studentIds = entries.map((e: Record<string, unknown>) => e.student_id)

  let nameMap = new Map<string, string>()
  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name')
      .in('id', studentIds)
    nameMap = new Map(
      (students || []).map((s: Record<string, unknown>) => [s.id as string, s.full_name as string])
    )
  }

  const leaderboard = entries.map((entry: Record<string, unknown>, idx: number) => ({
    rank: idx + 1,
    studentId: entry.student_id,
    name: nameMap.get(entry.student_id as string) || 'Student',
    totalPoints: entry.total_points,
    streak: entry.current_streak_days,
    sessions: entry.total_sessions_completed,
    isCurrentUser: entry.student_id === user.id,
  }))

  return NextResponse.json(leaderboard)
}
