"use client"

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Star, MessageSquare, Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeaderboardCardProps {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  rank: number;
  level: number;
  streak: number;
  totalIdeas: number;
  totalFeedback: number;
  onClick?: () => void;
}

const getRankEmoji = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `${rank}`;
  }
};

const getLevelEmoji = (level: number) => {
  if (level >= 10) return "🌟";
  if (level >= 7) return "⭐";
  if (level >= 4) return "✨";
  return "💫";
};

const getLevelColor = (level: number) => {
  if (level >= 10) return "bg-yellow-500/10 text-yellow-500";
  if (level >= 7) return "bg-blue-500/10 text-blue-500";
  if (level >= 4) return "bg-green-500/10 text-green-500";
  return "bg-gray-500/10 text-gray-500";
};

export function LeaderboardCard({
  id,
  name,
  email,
  avatar,
  points,
  rank,
  level,
  streak,
  totalIdeas,
  totalFeedback,
  onClick,
}: LeaderboardCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Rank */}
        <div className="flex w-12 items-center justify-center">
          <span className={cn("text-2xl font-bold", getRankColor(rank))}>
            #{rank}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="h-12 w-12 rounded-full border-2 border-background"
          />
          <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1">
            <span className="text-xs">{getLevelEmoji(level)}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{points}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Points</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                <span>{totalIdeas}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Ideas Submitted</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span>{totalFeedback}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Feedback Given</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>{streak}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current Activity Streak</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
} 