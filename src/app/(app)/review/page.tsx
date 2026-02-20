"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SECTION_LABELS } from "@/lib/constants"
import {
  AlertTriangle,
  Brain,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface Weakness {
  topic: string
  topicLabel: string
  section: string
  accuracy_pct: number
  total_attempts: number
  avg_time_seconds: number
}

export default function ReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/progress/weaknesses")
      .then((r) => r.json())
      .then((data) => setWeaknesses(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  // Auto-generate if topic is in URL params
  useEffect(() => {
    const topic = searchParams.get("topic")
    const section = searchParams.get("section")
    if (topic && section && !loading) {
      handleGenerate(topic, section)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading])

  async function handleGenerate(topic: string, section: string) {
    setGenerating(topic)
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          section,
          difficulty: "medium",
          count: 10,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to generate questions")
        return
      }

      const data = await res.json()
      router.push(`/practice/${data.sessionId}`)
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          My Weaknesses
        </h1>
        <p className="text-muted-foreground">
          These are the topics where your accuracy is below 70%. Click
          &quot;Generate AI Practice&quot; to get personalized questions.
        </p>
      </div>

      {weaknesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No weaknesses detected yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete some practice sessions and we&apos;ll identify the topics you
              need to work on.
            </p>
            <Button onClick={() => router.push("/practice")}>
              Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {weaknesses.map((w) => (
            <Card key={w.topic}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{w.topicLabel}</h3>
                      <Badge variant="outline">
                        {SECTION_LABELS[w.section as keyof typeof SECTION_LABELS]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">
                            Accuracy
                          </span>
                          <span className="text-sm font-medium text-orange-600">
                            {w.accuracy_pct}%
                          </span>
                        </div>
                        <Progress value={w.accuracy_pct} className="h-2" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{w.total_attempts}</p>
                        <p className="text-xs text-muted-foreground">attempts</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleGenerate(w.topic, w.section)}
                    disabled={generating === w.topic}
                    className="shrink-0"
                  >
                    {generating === w.topic ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate AI Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
