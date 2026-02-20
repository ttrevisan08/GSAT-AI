import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { POINTS } from '@/lib/constants'

const ProgressSchema = z.object({
  wordId: z.string().uuid(),
  isCorrect: z.boolean(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = ProgressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { wordId, isCorrect } = parsed.data

  // Get or create student vocabulary record
  const { data: existing } = await supabase
    .from('student_vocabulary')
    .select('*')
    .eq('student_id', user.id)
    .eq('word_id', wordId)
    .single()

  const now = new Date().toISOString()

  if (!existing) {
    // First time seeing this word
    const intervalHours = isCorrect ? 2 : 1
    const nextReview = new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString()

    await supabase.from('student_vocabulary').insert({
      student_id: user.id,
      word_id: wordId,
      mastery: isCorrect ? 'learning' : 'new',
      times_seen: 1,
      times_correct: isCorrect ? 1 : 0,
      last_reviewed_at: now,
      next_review_at: nextReview,
      current_interval_hours: intervalHours,
    })
  } else {
    // Update existing
    let newInterval: number
    let newMastery = existing.mastery

    if (isCorrect) {
      newInterval = existing.current_interval_hours * 2
      // Advance mastery
      if (existing.mastery === 'new') newMastery = 'learning'
      else if (existing.mastery === 'learning' && existing.times_correct >= 3) newMastery = 'reviewing'
      else if (existing.mastery === 'reviewing' && existing.times_correct >= 7) newMastery = 'mastered'
    } else {
      newInterval = 1
      if (existing.mastery === 'reviewing') newMastery = 'learning'
      else if (existing.mastery === 'mastered') newMastery = 'reviewing'
    }

    const nextReview = new Date(Date.now() + newInterval * 60 * 60 * 1000).toISOString()

    await supabase
      .from('student_vocabulary')
      .update({
        mastery: newMastery,
        times_seen: existing.times_seen + 1,
        times_correct: existing.times_correct + (isCorrect ? 1 : 0),
        last_reviewed_at: now,
        next_review_at: nextReview,
        current_interval_hours: newInterval,
      })
      .eq('id', existing.id)

    // Award points if mastered
    if (newMastery === 'mastered' && existing.mastery !== 'mastered') {
      await supabase.from('point_history').insert({
        student_id: user.id,
        action: 'vocabulary_mastered',
        points: POINTS.vocabulary_mastered,
        metadata: { word_id: wordId },
      })
    }
  }

  return NextResponse.json({ success: true })
}
