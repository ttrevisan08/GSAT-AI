import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') || 'learn' // 'learn' | 'review'
  const limit = parseInt(searchParams.get('limit') || '10')

  if (mode === 'review') {
    // Get words due for review (spaced repetition)
    const { data: dueWords, error } = await supabase
      .from('student_vocabulary')
      .select('*, vocabulary_words(*)')
      .eq('student_id', user.id)
      .lte('next_review_at', new Date().toISOString())
      .neq('mastery', 'mastered')
      .order('next_review_at', { ascending: true })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (dueWords && dueWords.length > 0) {
      return NextResponse.json(dueWords)
    }
  }

  // Get new words the student hasn't seen yet
  const { data: seenWordIds } = await supabase
    .from('student_vocabulary')
    .select('word_id')
    .eq('student_id', user.id)

  const seenIds = (seenWordIds || []).map((s) => s.word_id)

  let query = supabase
    .from('vocabulary_words')
    .select('*')
    .eq('is_active', true)
    .order('sat_frequency', { ascending: false })
    .limit(limit)

  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`)
  }

  const { data: newWords, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(newWords)
}
