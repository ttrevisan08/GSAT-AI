"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  Volume2,
} from "lucide-react"

interface VocabularyWord {
  id: string
  word: string
  definition: string
  part_of_speech: string | null
  example_sentence: string | null
  pronunciation_ipa: string | null
  difficulty: string
  portuguese_translation: string | null
  synonyms: string[]
  antonyms: string[]
}

type StudyMode = "learn" | "quiz"

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<StudyMode>("learn")
  const [showDefinition, setShowDefinition] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const fetchWords = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/vocabulary?mode=learn&limit=10")
    const data = await res.json()
    setWords(Array.isArray(data) ? data : [])
    setCurrentIndex(0)
    setStats({ correct: 0, total: 0 })
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const currentWord = words[currentIndex]
  const progressPct = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0

  async function handleKnow(isCorrect: boolean) {
    if (!currentWord) return

    await fetch("/api/vocabulary/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: currentWord.id, isCorrect }),
    })

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    nextWord()
  }

  function nextWord() {
    setShowDefinition(false)
    setQuizAnswer(null)
    setQuizResult(null)
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  function generateQuizOptions(word: VocabularyWord): string[] {
    const otherWords = words
      .filter((w) => w.id !== word.id)
      .map((w) => w.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [...otherWords, word.definition].sort(
      () => Math.random() - 0.5
    )
    return options
  }

  function handleQuizAnswer(answer: string) {
    if (!currentWord || quizResult !== null) return
    const isCorrect = answer === currentWord.definition
    setQuizAnswer(answer)
    setQuizResult(isCorrect)
    handleKnow(isCorrect)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Vocabulary
        </h1>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No words available</h3>
            <p className="text-sm text-muted-foreground">
              Vocabulary words will be added soon. Check back later!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLastWord = currentIndex >= words.length - 1 && (showDefinition || quizResult !== null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Vocabulary
        </h1>
        <div className="flex gap-2">
          <Button
            variant={mode === "learn" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("learn")}
          >
            Flashcards
          </Button>
          <Button
            variant={mode === "quiz" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("quiz")}
          >
            Quiz
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {currentIndex + 1} / {words.length}
        </span>
        <Progress value={progressPct} className="flex-1" />
        <Badge variant="secondary">
          {stats.correct}/{stats.total} correct
        </Badge>
      </div>

      {/* Flashcard Mode */}
      {mode === "learn" && currentWord && (
        <Card className="mx-auto max-w-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-3xl">{currentWord.word}</CardTitle>
              {currentWord.pronunciation_ipa && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  {currentWord.pronunciation_ipa}
                </span>
              )}
            </div>
            {currentWord.part_of_speech && (
              <Badge variant="outline">{currentWord.part_of_speech}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!showDefinition ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-6">
                  Do you know this word?
                </p>
                <Button onClick={() => setShowDefinition(true)}>
                  Show Definition
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="font-medium">{currentWord.definition}</p>
                  {currentWord.example_sentence && (
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{currentWord.example_sentence}&quot;
                    </p>
                  )}
                  {currentWord.portuguese_translation && (
                    <p className="text-sm">
                      <span className="font-medium">PT:</span>{" "}
                      {currentWord.portuguese_translation}
                    </p>
                  )}
                </div>

                {currentWord.synonyms.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Synonyms:
                    </span>{" "}
                    <span className="text-sm">
                      {currentWord.synonyms.join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleKnow(false)}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Still Learning
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleKnow(true)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Got It!
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Mode */}
      {mode === "quiz" && currentWord && (
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {currentWord.word}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Choose the correct definition
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {generateQuizOptions(currentWord).map((option, idx) => {
              const isSelected = quizAnswer === option
              const isCorrect = option === currentWord.definition
              const showResult = quizResult !== null

              let className =
                "w-full rounded-lg border p-3 text-left text-sm transition-colors "

              if (showResult) {
                if (isCorrect) {
                  className += "border-green-500 bg-green-50"
                } else if (isSelected && !isCorrect) {
                  className += "border-red-500 bg-red-50"
                } else {
                  className += "opacity-50"
                }
              } else {
                className += "hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
              }

              return (
                <button
                  key={idx}
                  className={className}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={showResult}
                >
                  {option}
                </button>
              )
            })}

            {quizResult !== null && (
              <div className="pt-4">
                {currentWord.portuguese_translation && (
                  <p className="text-sm text-center text-muted-foreground mb-3">
                    PT: {currentWord.portuguese_translation}
                  </p>
                )}
                {!isLastWord && (
                  <Button onClick={nextWord} className="w-full">
                    Next Word <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session complete */}
      {isLastWord && (
        <Card className="mx-auto max-w-lg">
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Session Complete!</h3>
            <p className="text-muted-foreground mb-4">
              You got {stats.correct} out of {stats.total} correct.
            </p>
            <Button onClick={fetchWords}>
              <RotateCcw className="mr-2 h-4 w-4" /> Study More Words
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
