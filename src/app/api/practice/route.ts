import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const CreateSessionSchema = z.object({
  section: z.enum(['math', 'reading_writing']),
  topic: z.string().optional(),
  sessionType: z.enum(['topic_practice', 'weakness_drill', 'full_section']).default('topic_practice'),
  questionCount: z.number().min(5).max(30).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { section, topic, sessionType, questionCount, difficulty } = parsed.data

  // Fetch questions from the bank
  let query = supabase
    .from('questions')
    .select('id')
    .eq('section', section)
    .eq('is_active', true)

  if (topic) query = query.eq('topic', topic)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data: questions, error: qError } = await query.limit(questionCount)

  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })
  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'No questions available for this selection' }, { status: 404 })
  }

  // Create session
  const { data: session, error: sError } = await supabase
    .from('practice_sessions')
    .insert({
      student_id: user.id,
      section,
      topic: topic || null,
      session_type: sessionType,
      total_questions: questions.length,
    })
    .select('id')
    .single()

  if (sError) return NextResponse.json({ error: sError.message }, { status: 500 })

  // Create empty attempts
  const attempts = questions.map((q, idx) => ({
    session_id: session.id,
    student_id: user.id,
    question_id: q.id,
    sequence_number: idx + 1,
  }))

  const { error: aError } = await supabase.from('question_attempts').insert(attempts)

  if (aError) return NextResponse.json({ error: aError.message }, { status: 500 })

  return NextResponse.json({ sessionId: session.id, questionCount: questions.length })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
