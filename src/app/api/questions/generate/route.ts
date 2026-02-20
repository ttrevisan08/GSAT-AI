import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateQuestions, buildStudentContext } from '@/lib/ai/question-generator'
import { z } from 'zod'

const RequestSchema = z.object({
  topic: z.string(),
  section: z.enum(['math', 'reading_writing']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().min(1).max(20).default(10),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { topic, section, difficulty, count } = parsed.data
  const serviceClient = await createServiceClient()

  // Get student's performance on this topic
  const { data: perfData } = await supabase
    .from('student_topic_performance' as never)
    .select('*')
    .eq('student_id', user.id)
    .eq('topic', topic)
    .single()

  const topicPerf = perfData as { accuracy_pct: number; total_attempts: number } | null

  // Get recent wrong answer stems for context
  const { data: recentErrors } = await supabase
    .from('question_attempts')
    .select('question_id, questions(stem)')
    .eq('student_id', user.id)
    .eq('is_correct', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const errorStems = (recentErrors || [])
    .map((e: Record<string, unknown>) => {
      const q = e.questions as { stem: string } | null
      return q?.stem
    })
    .filter(Boolean) as string[]

  const studentContext = topicPerf
    ? buildStudentContext(
        { topic, accuracy_pct: topicPerf.accuracy_pct, total_attempts: topicPerf.total_attempts },
        errorStems.map((s) => s.slice(0, 80))
      )
    : `Student is starting to practice ${topic} for the first time.`

  try {
    const generated = await generateQuestions({
      topic,
      difficulty,
      count,
      studentContext,
    })

    // Save generated questions to DB using service client (bypasses RLS)
    const questionsToInsert = generated.map((q) => ({
      section,
      topic,
      difficulty,
      source: 'ai_generated' as const,
      stem: q.stem,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      ai_model: 'gpt-4o',
      ai_prompt_context: studentContext.slice(0, 500),
    }))

    const { data: savedQuestions, error: insertError } = await serviceClient
      .from('questions')
      .insert(questionsToInsert)
      .select('id')

    if (insertError) throw insertError

    // Create a practice session with these questions
    const questionIds = savedQuestions.map((q) => q.id)

    const { data: session, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        student_id: user.id,
        section,
        topic,
        session_type: 'ai_generated',
        total_questions: questionIds.length,
      })
      .select('id')
      .single()

    if (sessionError) throw sessionError

    // Pre-create question attempts (without answers)
    const attempts = questionIds.map((qId, idx) => ({
      session_id: session.id,
      student_id: user.id,
      question_id: qId,
      sequence_number: idx + 1,
    }))

    await supabase.from('question_attempts').insert(attempts)

    return NextResponse.json({
      sessionId: session.id,
      questionCount: questionIds.length,
    })
  } catch (err) {
    console.error('AI generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
