import { getOpenAI, AI_MODELS } from './client'
import { PROMPTS } from './prompts'
import { z } from 'zod'
import { getTopicLabel } from '@/lib/constants'

const GeneratedQuestionSchema = z.object({
  stem: z.string(),
  options: z
    .array(
      z.object({
        key: z.enum(['A', 'B', 'C', 'D']),
        text: z.string(),
      })
    )
    .length(4),
  correct_answer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string(),
})

const GenerateResponseSchema = z.object({
  questions: z.array(GeneratedQuestionSchema),
})

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>

export async function generateQuestions(params: {
  topic: string
  difficulty: string
  count: number
  studentContext: string
}): Promise<GeneratedQuestion[]> {
  const prompt = PROMPTS.GENERATE_QUESTIONS({
    ...params,
    topicLabel: getTopicLabel(params.topic),
  })

  const completion = await getOpenAI().chat.completions.create({
    model: AI_MODELS.QUESTION_GENERATION,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('Empty response from AI')

  const raw = JSON.parse(content)
  const validated = GenerateResponseSchema.parse(raw)

  return validated.questions
}

export function buildStudentContext(
  weakTopicData: {
    topic: string
    accuracy_pct: number
    total_attempts: number
  },
  recentErrors: string[]
): string {
  const topicLabel = getTopicLabel(weakTopicData.topic)
  let context = `Student has ${weakTopicData.accuracy_pct}% accuracy on ${topicLabel} `
  context += `(${weakTopicData.total_attempts} attempts total). `

  if (recentErrors.length > 0) {
    context += `Recent wrong answers involved: ${recentErrors.join(', ')}.`
  }

  return context
}
