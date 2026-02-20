import OpenAI from 'openai'

let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

export const AI_MODELS = {
  QUESTION_GENERATION: 'gpt-4o',
  VOCABULARY: 'gpt-4o-mini',
  STUDY_PLAN: 'gpt-4o',
} as const
