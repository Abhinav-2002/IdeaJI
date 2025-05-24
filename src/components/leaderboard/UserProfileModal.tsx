"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Star, MessageSquare, Share2, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface UserProfileModalProps {
  user: {
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
    bio?: string;
    pointsBreakdown?: {
      ideas: number;
      feedback: number;
      streak: number;
      other: number;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

const getLevelEmoji = (level: string) => {
  switch (level) {
    case 'Ideator': return '🚀';
    case 'Innovator': return '💡';
    case 'Visionary': return '🧠';
    default: return '🚀';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Ideator': return 'bg-blue-500/10 text-blue-500';
    case 'Innovator': return 'bg-purple-500/10 text-purple-500';
    case 'Visionary': return 'bg-yellow-500/10 text-yellow-500';
    default: return 'bg-gray-500/10 text-gray-500';
  }
};

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">#{user.rank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{user.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold">{user.points}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{user.streak} days</p>
              </div>
            </div>
          </Card>

          {user.bio && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Activity</h3>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Ideas</span>
                <span className="font-medium">{user.totalIdeas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feedback Given</span>
                <span className="font-medium">{user.totalFeedback}</span>
              </div>
            </div>
          </Card>

          {user.pointsBreakdown && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Points Breakdown</h3>
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ideas</span>
                  <span className="font-medium">{user.pointsBreakdown.ideas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Feedback</span>
                  <span className="font-medium">{user.pointsBreakdown.feedback}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Streak Bonus</span>
                  <span className="font-medium">{user.pointsBreakdown.streak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Other</span>
                  <span className="font-medium">{user.pointsBreakdown.other}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 