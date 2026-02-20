import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get session
  const { data: session, error: sError } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('student_id', user.id)
    .single()

  if (sError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Get attempts with question data
  const { data: attempts, error: aError } = await supabase
    .from('question_attempts')
    .select('*, questions(*)')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true })

  if (aError) return NextResponse.json({ error: aError.message }, { status: 500 })

  // Transform options from {A: "text", B: "text"} or JSON string to [{key: "A", text: "text"}, ...]
  const transformedAttempts = (attempts || []).map((attempt: Record<string, unknown>) => {
    const q = attempt.questions as Record<string, unknown> | null
    if (q && q.options) {
      let optionsObj = q.options
      // If options is a string (JSONB returned as string), parse it first
      if (typeof optionsObj === 'string') {
        try { optionsObj = JSON.parse(optionsObj) } catch { /* keep as-is */ }
      }
      // Convert object {A: "text"} to array [{key: "A", text: "text"}]
      if (optionsObj && typeof optionsObj === 'object' && !Array.isArray(optionsObj)) {
        q.options = Object.entries(optionsObj as Record<string, string>).map(([key, text]) => ({ key, text }))
      }
    }
    return attempt
  })

  return NextResponse.json({ session, attempts: transformedAttempts })
}
