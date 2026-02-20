import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTopicLabel } from '@/lib/constants'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Query the materialized view for topics with low accuracy
  const { data, error } = await supabase
    .from('student_topic_performance' as never)
    .select('*')
    .eq('student_id', user.id)
    .order('accuracy_pct', { ascending: true })
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const weaknesses = ((data || []) as Array<{
    topic: string
    section: string
    accuracy_pct: number
    total_attempts: number
    avg_time_seconds: number
    last_attempt_at: string
  }>)
    .filter((d) => d.accuracy_pct < 70)
    .map((d) => ({
      ...d,
      topicLabel: getTopicLabel(d.topic),
    }))

  return NextResponse.json(weaknesses)
}
