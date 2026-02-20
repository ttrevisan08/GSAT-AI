export const PROMPTS = {
  GENERATE_QUESTIONS: (params: {
    topic: string
    topicLabel: string
    difficulty: string
    count: number
    studentContext: string
  }) => `You are an expert SAT test prep tutor specializing in the Digital SAT format.
Generate ${params.count} SAT-style multiple choice questions.

TOPIC: ${params.topicLabel} (${params.topic})
DIFFICULTY: ${params.difficulty}
STUDENT CONTEXT: ${params.studentContext}

REQUIREMENTS:
- Each question must be realistic for the Digital SAT format
- Target the specific weaknesses described in the student context
- Provide 4 answer choices labeled A, B, C, D
- Include a detailed explanation for the correct answer
- For math: use LaTeX notation in $...$ for inline math
- Vary question structures (computational, conceptual, word problems)
- Match "${params.difficulty}" difficulty level

RESPONSE FORMAT (strict JSON, no markdown):
{
  "questions": [
    {
      "stem": "question text here",
      "options": [
        {"key": "A", "text": "option text"},
        {"key": "B", "text": "option text"},
        {"key": "C", "text": "option text"},
        {"key": "D", "text": "option text"}
      ],
      "correct_answer": "B",
      "explanation": "detailed explanation here"
    }
  ]
}`,

  GENERATE_VOCABULARY_QUIZ: (params: {
    word: string
    definition: string
    partOfSpeech: string
  }) => `Create a vocabulary exercise for the SAT word "${params.word}" (${params.partOfSpeech}: ${params.definition}).

Generate a sentence-completion question where the student must identify the correct usage of "${params.word}".
Create 3 plausible but incorrect distractor words.
Include Portuguese translation for Brazilian students.

RESPONSE FORMAT (strict JSON, no markdown):
{
  "sentence_with_blank": "The politician's _____ speech convinced even the skeptics.",
  "correct_answer": "${params.word}",
  "distractors": ["word1", "word2", "word3"],
  "portuguese_hint": "Portuguese translation or cognate",
  "usage_tip": "Brief tip on when/how this word is commonly used on the SAT"
}`,
}
