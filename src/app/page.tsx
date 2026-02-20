"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  BookOpen,
  Target,
  Trophy,
  ArrowRight,
  Zap,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">GSAT AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Button>
              Start Studying <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered SAT Prep
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Score 1200+ on the SAT with{" "}
          <span className="text-primary">AI-Powered</span> Practice
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The smartest way for Brazilian student-athletes to prepare for the
          SAT. Our AI identifies your weaknesses and generates personalized
          practice questions to help you improve faster.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="text-lg px-8">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-lg px-8">
              I have an account
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          How GSAT AI Helps You Score Higher
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="AI Question Generator"
            description="Got parabolas wrong? Our AI generates 10 questions specifically targeting your weak spots. Practice smarter, not harder."
            highlight
          />
          <FeatureCard
            icon={<BookOpen className="h-8 w-8" />}
            title="Vocabulary Builder"
            description="Master SAT vocabulary with spaced repetition, Portuguese translations, and contextual exercises designed for Brazilian students."
            highlight
          />
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Smart Practice"
            description="1000+ SAT questions organized by topic and difficulty. Practice any section with instant feedback and explanations."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Progress Dashboard"
            description="Track your estimated score, accuracy by topic, and study streaks. Know exactly where you stand."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Weakness Detection"
            description="Our AI analyzes your performance to find the exact topics dragging your score down, then helps you fix them."
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8" />}
            title="Gamification"
            description="Earn points, build streaks, and compete on the leaderboard. Stay motivated on your journey to 1200+."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to hit 1200+?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join GSAT AI today and start your personalized SAT prep journey.
          </p>
          <Button size="lg" variant="secondary" className="mt-8 text-lg px-8">
            Start Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GSAT AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode
  title: string
  description: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-primary/50 shadow-md" : ""}>
      <CardContent className="pt-6">
        <div
          className={`mb-4 inline-flex rounded-lg p-2 ${
            highlight
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
