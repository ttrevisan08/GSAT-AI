"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Flame, Loader2 } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  studentId: string
  name: string
  totalPoints: number
  streak: number
  sessions: number
  isCurrentUser: boolean
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/gamification/leaderboard?limit=20")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  function getRankIcon(rank: number) {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
    return <span className="text-sm font-medium text-muted-foreground">{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          See how you rank against other GSAT AI students.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
            <p className="text-sm text-muted-foreground">
              Start practicing to appear on the leaderboard!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Top Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.studentId}
                  className={`flex items-center gap-4 rounded-lg p-3 ${
                    entry.isCurrentUser
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.sessions} sessions completed
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {entry.streak > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {entry.streak}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="font-bold">{entry.totalPoints.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
