"use client"

import { motion } from "framer-motion"
import { Trophy, Star, MessageSquare, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UserStatsProps {
  stats: {
    totalIdeas: number
    totalFeedback: number
    totalPoints: number
    streak: number
    rank: number
    level: string
    nextLevelPoints: number
    currentLevelPoints: number
  }
}

export function UserStats({ stats }: UserStatsProps) {
  const progressToNextLevel = Math.round(
    ((stats.currentLevelPoints - stats.nextLevelPoints) / stats.nextLevelPoints) * 100
  )

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Visionary":
        return "text-yellow-500"
      case "Innovator":
        return "text-purple-500"
      case "Ideator":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case "Visionary":
        return "🌟"
      case "Innovator":
        return "💡"
      case "Ideator":
        return "🚀"
      default:
        return "✨"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Total Points</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.totalPoints}</p>
          <div className="mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Level Progress</span>
              <span className="font-medium">{progressToNextLevel}%</span>
            </div>
            <Progress value={progressToNextLevel} className="mt-1 h-2" />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Ideas Submitted</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.totalIdeas}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep innovating!
          </p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Feedback Given</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.totalFeedback}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Help others grow!
          </p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Current Streak</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.streak} days</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("text-sm font-medium", getLevelColor(stats.level))}>
              {getLevelEmoji(stats.level)} {stats.level}
            </span>
            <span className="text-sm text-muted-foreground">
              Rank #{stats.rank}
            </span>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 