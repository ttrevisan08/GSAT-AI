import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { POINTS } from '@/lib/constants'

const SubmitSchema = z.object({
  questionId: z.string().uuid(),
  selectedAnswer: z.string(),
  timeSpentSeconds: z.number().min(0).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = SubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { questionId, selectedAnswer, timeSpentSeconds } = parsed.data

  // Get the correct answer
  const { data: question } = await supabase
    .from('questions')
    .select('correct_answer')
    .eq('id', questionId)
    .single()

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const isCorrect = selectedAnswer === question.correct_answer

  // Update the attempt
  const { error: updateError } = await supabase
    .from('question_attempts')
    .update({
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds || null,
    })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('student_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Update session correct_answers count if correct
  if (isCorrect) {
    // Get current correct_answers count and increment
    const { data: sessionData } = await supabase
      .from('practice_sessions')
      .select('correct_answers')
      .eq('id', sessionId)
      .single()

    await supabase
      .from('practice_sessions')
      .update({ correct_answers: (sessionData?.correct_answers || 0) + 1 })
      .eq('id', sessionId)

    // Award points
    await supabase.from('point_history').insert({
      student_id: user.id,
      action: 'question_correct',
      points: POINTS.question_correct,
      metadata: { question_id: questionId, session_id: sessionId },
    })
  }

  // Update gamification counters
  const { data: gamData } = await supabase
    .from('student_gamification')
    .select('total_points, total_questions_answered, total_correct_answers')
    .eq('student_id', user.id)
    .single()

  if (gamData) {
    await supabase
      .from('student_gamification')
      .update({
        total_points: (gamData.total_points || 0) + (isCorrect ? POINTS.question_correct : 0),
        total_questions_answered: (gamData.total_questions_answered || 0) + 1,
        total_correct_answers: (gamData.total_correct_answers || 0) + (isCorrect ? 1 : 0),
      })
      .eq('student_id', user.id)
  }

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correct_answer,
  })
}
