import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section')
  const topic = searchParams.get('topic')
  const difficulty = searchParams.get('difficulty')
  const limit = parseInt(searchParams.get('limit') || '10')

  let query = supabase.from('questions').select('*').eq('is_active', true)

  if (section) query = query.eq('section', section)
  if (topic) query = query.eq('topic', topic)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data, error } = await query.limit(limit).order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
