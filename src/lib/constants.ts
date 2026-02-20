export const SAT_SECTIONS = ['math', 'reading_writing'] as const
export type SATSection = (typeof SAT_SECTIONS)[number]

export const SAT_TOPICS = {
  math: [
    { value: 'algebra_linear_equations', label: 'Linear Equations' },
    { value: 'algebra_systems', label: 'Systems of Equations' },
    { value: 'algebra_inequalities', label: 'Inequalities' },
    { value: 'advanced_math_quadratics', label: 'Quadratics' },
    { value: 'advanced_math_polynomials', label: 'Polynomials' },
    { value: 'advanced_math_exponential', label: 'Exponential Functions' },
    { value: 'advanced_math_radicals', label: 'Radicals & Rational Exponents' },
    { value: 'advanced_math_rational', label: 'Rational Expressions' },
    { value: 'problem_solving_ratios', label: 'Ratios & Proportions' },
    { value: 'problem_solving_percentages', label: 'Percentages' },
    { value: 'problem_solving_units', label: 'Units & Conversions' },
    { value: 'problem_solving_scatterplots', label: 'Scatterplots & Data' },
    { value: 'problem_solving_probability', label: 'Probability' },
    { value: 'problem_solving_statistics', label: 'Statistics' },
    { value: 'geometry_lines_angles', label: 'Lines & Angles' },
    { value: 'geometry_triangles', label: 'Triangles' },
    { value: 'geometry_circles', label: 'Circles' },
    { value: 'geometry_volume_area', label: 'Volume & Area' },
    { value: 'trigonometry', label: 'Trigonometry' },
  ],
  reading_writing: [
    { value: 'rw_central_ideas', label: 'Central Ideas & Details' },
    { value: 'rw_command_of_evidence', label: 'Command of Evidence' },
    { value: 'rw_inferences', label: 'Inferences' },
    { value: 'rw_words_in_context', label: 'Words in Context' },
    { value: 'rw_text_structure', label: 'Text Structure & Purpose' },
    { value: 'rw_cross_text_connections', label: 'Cross-Text Connections' },
    { value: 'rw_rhetorical_synthesis', label: 'Rhetorical Synthesis' },
    { value: 'rw_standard_english_conventions', label: 'Standard English Conventions' },
    { value: 'rw_boundaries', label: 'Boundaries' },
    { value: 'rw_form_structure_sense', label: 'Form, Structure & Sense' },
    { value: 'rw_transitions', label: 'Transitions' },
  ],
} as const

export type SATTopic =
  | (typeof SAT_TOPICS.math)[number]['value']
  | (typeof SAT_TOPICS.reading_writing)[number]['value']

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]

export const QUESTION_SOURCES = ['bluebook', 'cit', 'internet', 'ai_generated', 'custom'] as const
export type QuestionSource = (typeof QUESTION_SOURCES)[number]

export const POINTS = {
  question_correct: 10,
  question_streak_5: 50,
  question_streak_10: 100,
  session_complete: 25,
  daily_login: 5,
  vocabulary_mastered: 20,
  weakness_improved: 30,
} as const

export const SECTION_LABELS: Record<SATSection, string> = {
  math: 'Math',
  reading_writing: 'Reading & Writing',
}

export function getTopicLabel(topicValue: string): string {
  for (const section of Object.values(SAT_TOPICS)) {
    const found = section.find((t) => t.value === topicValue)
    if (found) return found.label
  }
  return topicValue
}

export function getTopicsBySection(section: SATSection) {
  return SAT_TOPICS[section]
}
