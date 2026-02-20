"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getTopicLabel, SECTION_LABELS } from "@/lib/constants"
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  BarChart3,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"

interface QuestionData {
  id: string
  stem: string
  options: { key: string; text: string }[]
  correct_answer: string
  explanation: string | null
  section: string
  topic: string
  difficulty: string
}

interface AttemptData {
  id: string
  question_id: string
  selected_answer: string | null
  is_correct: boolean | null
  sequence_number: number
  questions: QuestionData
}

interface SessionData {
  id: string
  section: string
  topic: string | null
  session_type: string
  status: string
  total_questions: number
  correct_answers: number
}

export default function PracticeSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [attempts, setAttempts] = useState<AttemptData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [result, setResult] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completionData, setCompletionData] = useState<{
    correct: number
    total: number
    accuracy: number
    pointsEarned: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [startTime, setStartTime] = useState(Date.now())

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/practice/${sessionId}`)
    if (!res.ok) {
      router.push("/practice")
      return
    }
    const data = await res.json()
    setSession(data.session)
    setAttempts(data.attempts)

    // Find first unanswered question
    const firstUnanswered = data.attempts.findIndex(
      (a: AttemptData) => a.selected_answer === null
    )
    if (firstUnanswered >= 0) {
      setCurrentIndex(firstUnanswered)
    } else if (data.session.status === "completed") {
      setCompleted(true)
    }

    setLoading(false)
    setStartTime(Date.now())
  }, [sessionId, router])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const currentAttempt = attempts[currentIndex]
  const question = currentAttempt?.questions
  const answeredCount = attempts.filter((a) => a.selected_answer !== null).length
  const progressPct = session ? (answeredCount / session.total_questions) * 100 : 0

  async function handleSubmit() {
    if (!selectedAnswer || !currentAttempt) return
    setSubmitting(true)

    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    try {
      const res = await fetch(`/api/practice/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentAttempt.question_id,
          selectedAnswer,
          timeSpentSeconds: timeSpent,
        }),
      })

      const data = await res.json()
      setResult(data)

      // Update local attempt
      setAttempts((prev) =>
        prev.map((a, i) =>
          i === currentIndex
            ? { ...a, selected_answer: selectedAnswer, is_correct: data.isCorrect }
            : a
        )
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNext() {
    if (currentIndex < attempts.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setResult(null)
      setStartTime(Date.now())
    } else {
      // Complete session
      const res = await fetch(`/api/practice/${sessionId}/complete`, {
        method: "POST",
      })
      const data = await res.json()
      setCompletionData(data)
      setCompleted(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (completed && completionData) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{completionData.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {completionData.correct}/{completionData.total}
                </p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                +{completionData.pointsEarned} points
              </Badge>
            </div>

            <div className="flex gap-3">
              <Link href="/practice" className="flex-1">
                <Button variant="outline" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" /> New Session
                </Button>
              </Link>
              <Link href="/review" className="flex-1">
                <Button className="w-full">
                  View Weaknesses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {answeredCount + (result ? 1 : 0)} / {session?.total_questions}
        </span>
        <Progress value={progressPct} className="flex-1" />
        <div className="flex gap-2">
          {session?.topic && (
            <Badge variant="outline">{getTopicLabel(session.topic)}</Badge>
          )}
          <Badge variant="secondary">
            {session?.section ? SECTION_LABELS[session.section as keyof typeof SECTION_LABELS] : ""}
          </Badge>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">Question {currentIndex + 1}</Badge>
            <Badge variant="secondary">{question.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed">{question.stem}</p>

          {/* Answer options */}
          <div className="space-y-2">
            {question.options.map((opt) => {
              const isSelected = selectedAnswer === opt.key
              const isSubmitted = result !== null
              const isCorrectAnswer = result?.correctAnswer === opt.key
              const isWrongSelection = isSubmitted && isSelected && !result?.isCorrect

              let className =
                "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors "

              if (isSubmitted) {
                if (isCorrectAnswer) {
                  className += "border-green-500 bg-green-50 text-green-900"
                } else if (isWrongSelection) {
                  className += "border-red-500 bg-red-50 text-red-900"
                } else {
                  className += "border-muted opacity-50"
                }
              } else if (isSelected) {
                className += "border-primary bg-primary/5"
              } else {
                className += "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
              }

              return (
                <button
                  key={opt.key}
                  className={className}
                  onClick={() => !isSubmitted && setSelectedAnswer(opt.key)}
                  disabled={isSubmitted}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                    {opt.key}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {isSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {isWrongSelection && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation after submit */}
          {result && question.explanation && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {!result ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex < attempts.length - 1 ? (
                  <>
                    Next Question <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Finish Session"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
