"use client"

import { motion } from "framer-motion"
import { Trophy, Star, MessageSquare, Share2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UserRankCardProps {
  rank: number
  points: number
  progressToTop10: number
  onTipClick: (action: string) => void
}

export function UserRankCard({
  rank,
  points,
  progressToTop10,
  onTipClick,
}: UserRankCardProps) {
  const tips = [
    {
      icon: Star,
      label: "Submit Idea",
      points: "+50 pts",
      action: "submit-idea",
      color: "text-blue-500",
    },
    {
      icon: MessageSquare,
      label: "Improve Idea",
      points: "+30 pts",
      action: "improve-idea",
      color: "text-green-500",
    },
    {
      icon: Trophy,
      label: "Give Feedback",
      points: "+10 pts",
      action: "give-feedback",
      color: "text-yellow-500",
    },
    {
      icon: Share2,
      label: "Share on Social",
      points: "+20 pts",
      action: "share",
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Rank</h3>
              <p className="text-3xl font-bold mt-2">#{rank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{points}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Top 10</span>
              <span className="font-medium">{progressToTop10}%</span>
            </div>
            <Progress value={progressToTop10} className="mt-2 h-2" />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How to Climb the Ranks</h3>
          <div className="grid gap-3">
            {tips.map((tip) => (
              <Button
                key={tip.action}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => onTipClick(tip.action)}
              >
                <tip.icon className={cn("h-5 w-5 mr-3", tip.color)} />
                <div className="flex-1 text-left">
                  <p className="font-medium">{tip.label}</p>
                  <p className="text-sm text-muted-foreground">{tip.points}</p>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 