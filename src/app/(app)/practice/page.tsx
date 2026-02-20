"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SAT_TOPICS, SECTION_LABELS, type SATSection } from "@/lib/constants"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, BookText, ArrowRight, Loader2 } from "lucide-react"

export default function PracticePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function startSession(section: SATSection, topicValue: string) {
    setLoading(topicValue)
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          topic: topicValue,
          questionCount: 10,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to start session")
        return
      }

      const data = await res.json()
      router.push(`/practice/${data.sessionId}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="text-muted-foreground">
          Choose a topic to start practicing. Each session has 10 questions.
        </p>
      </div>

      <Tabs defaultValue="math">
        <TabsList>
          <TabsTrigger value="math" className="gap-2">
            <Calculator className="h-4 w-4" />
            {SECTION_LABELS.math}
          </TabsTrigger>
          <TabsTrigger value="reading_writing" className="gap-2">
            <BookText className="h-4 w-4" />
            {SECTION_LABELS.reading_writing}
          </TabsTrigger>
        </TabsList>

        {(Object.keys(SAT_TOPICS) as SATSection[]).map((section) => (
          <TabsContent key={section} value={section}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SAT_TOPICS[section].map((topic) => (
                <Card key={topic.value} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{topic.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {section === "math" ? "Math" : "R&W"}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => startSession(section, topic.value)}
                        disabled={loading === topic.value}
                      >
                        {loading === topic.value ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <ArrowRight className="mr-1 h-3 w-3" />
                        )}
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
