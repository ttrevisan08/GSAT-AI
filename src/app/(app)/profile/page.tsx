"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Target, Calendar, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Student } from "@/types/database"

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("students")
          .select("*")
          .eq("id", user.id)
          .single()
        setStudent(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!student) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User className="h-6 w-6" />
        Profile
      </h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{student.full_name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{student.email}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Target Score</p>
              <p className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                {student.target_score}
              </p>
            </div>
            <Badge
              variant={student.subscription_status === "active" ? "default" : "secondary"}
            >
              {student.subscription_status}
            </Badge>
          </div>
          {student.sat_exam_date && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">SAT Exam Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(student.sat_exam_date).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="font-medium">
              {new Date(student.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
