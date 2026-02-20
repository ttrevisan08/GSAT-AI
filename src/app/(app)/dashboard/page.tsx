"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  BookOpen,
  Flame,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Brain,
} from "lucide-react"
import Link from "next/link"

interface ProgressData {
  stats: {
    totalQuestionsAnswered: number
    totalCorrect: number
    overallAccuracy: number
    estimatedScore: number
    totalSessions: number
    currentStreak: number
    totalPoints: number
  }
  vocabularyProgress: {
    new: number
    learning: number
    reviewing: number
    mastered: number
  }
  recentSessions: Array<{
    id: string
    section: string
    topic: string | null
    correct_answers: number
    total_questions: number
    completed_at: string
  }>
}

interface Weakness {
  topic: string
  topicLabel: string
  section: string
  accuracy_pct: number
  total_attempts: number
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/progress").then((r) => r.json()),
      fetch("/api/progress/weaknesses").then((r) => r.json()),
    ])
      .then(([prog, weak]) => {
        setProgress(prog)
        setWeaknesses(Array.isArray(weak) ? weak : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = progress?.stats
  const vocabTotal = progress?.vocabularyProgress
    ? Object.values(progress.vocabularyProgress).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/practice">
            <Button>
              <Target className="mr-2 h-4 w-4" /> Practice
            </Button>
          </Link>
          <Link href="/vocabulary">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" /> Vocabulary
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estimated Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.estimatedScore || "—"}</div>
            <p className="text-xs text-muted-foreground">out of 1600</p>
            <Progress value={((stats?.estimatedScore || 0) / 1600) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.overallAccuracy || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCorrect || 0} / {stats?.totalQuestionsAnswered || 0} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalSessions || 0} sessions completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Complete some practice sessions to see your weak areas here.
              </p>
            ) : (
              <div className="space-y-3">
                {weaknesses.map((w) => (
                  <div key={w.topic} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{w.topicLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.accuracy_pct}% accuracy ({w.total_attempts} attempts)
                      </p>
                    </div>
                    <Link href={`/review?topic=${w.topic}&section=${w.section}`}>
                      <Button size="sm" variant="outline">
                        Practice <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vocabulary Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Vocabulary Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vocabTotal === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Start learning SAT vocabulary words!
                </p>
                <Link href="/vocabulary">
                  <Button>Start Vocabulary</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(
                  [
                    { key: "mastered", label: "Mastered", color: "bg-green-500" },
                    { key: "reviewing", label: "Reviewing", color: "bg-blue-500" },
                    { key: "learning", label: "Learning", color: "bg-yellow-500" },
                    { key: "new", label: "New", color: "bg-gray-300" },
                  ] as const
                ).map(({ key, label, color }) => {
                  const count = progress?.vocabularyProgress[key] || 0
                  const pct = vocabTotal > 0 ? (count / vocabTotal) * 100 : 0
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${color}`} />
                      <span className="w-20 text-sm">{label}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
