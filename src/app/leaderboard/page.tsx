"use client";

import React, { useState, useEffect } from 'react';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { UserRankCard } from '@/components/leaderboard/UserRankCard';
import { UserStats } from '@/components/leaderboard/UserStats';
import { UserProfileModal } from '@/components/leaderboard/UserProfileModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Trophy, TrendingUp, Star, MessageSquare, Share2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    points: 1250,
    rank: 1,
    level: 5,
    streak: 7,
    totalIdeas: 15,
    totalFeedback: 28,
    bio: "Passionate about innovation and helping others succeed.",
    pointsBreakdown: {
      ideas: 750,
      feedback: 350,
      streak: 100,
      other: 50,
    },
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    points: 980,
    rank: 2,
    level: 4,
    streak: 5,
    totalIdeas: 12,
    totalFeedback: 22,
    bio: "Always looking for the next big idea.",
    pointsBreakdown: {
      ideas: 600,
      feedback: 280,
      streak: 70,
      other: 30,
    },
  },
  // Add more mock users as needed
];

const timeframes = ['This Week', 'This Month', 'All Time'] as const;
const sortOptions = ['Points', 'Streak', 'Ideas', 'Feedback'] as const;

export default function LeaderboardPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState<typeof timeframes[number]>('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<typeof sortOptions[number]>('Points');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minLevel: 'all',
    minIdeas: 0,
    minFeedback: 0,
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // Mock current user data - replace with actual user data
  const currentUser = {
    id: 'current-user-id',
    rank: 34,
    points: 760,
    progressToTop10: 65,
    stats: {
      totalIdeas: 8,
      totalFeedback: 25,
      totalPoints: 760,
      streak: 3,
      rank: 34,
      level: 'Ideator',
      nextLevelPoints: 1000,
      currentLevelPoints: 760,
    }
  };

  // Simulate loading state when changing filters
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedTimeframe, sortBy, searchQuery, advancedFilters]);

  // Filter and sort the leaderboard data
  const filteredData = mockUsers
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = advancedFilters.minLevel === 'all' || user.level === advancedFilters.minLevel;
      const matchesIdeas = user.totalIdeas >= advancedFilters.minIdeas;
      const matchesFeedback = user.totalFeedback >= advancedFilters.minFeedback;
      return matchesSearch && matchesLevel && matchesIdeas && matchesFeedback;
    })
    .sort((a, b) => {
      const multiplier = advancedFilters.sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'Points':
          return (b.points - a.points) * multiplier;
        case 'Streak':
          return ((b.streak || 0) - (a.streak || 0)) * multiplier;
        case 'Ideas':
          return ((b.totalIdeas || 0) - (a.totalIdeas || 0)) * multiplier;
        case 'Feedback':
          return ((b.totalFeedback || 0) - (a.totalFeedback || 0)) * multiplier;
        default:
          return 0;
      }
    });

  const handleUserClick = (user: typeof mockUsers[0]) => {
    if (user.id === currentUser.id) {
      router.push('/profile');
    } else {
      setSelectedUser(user);
    }
  };

  const handleTipClick = (action: string) => {
    switch (action) {
      case 'submit-idea':
        router.push('/ideas/new');
        break;
      case 'improve-idea':
        router.push('/ideas');
        break;
      case 'give-feedback':
        router.push('/feedback');
        break;
      case 'share':
        // Handle share action
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container max-w-7xl py-8 space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🏆 Top Innovators
          </h1>
          <p className="text-xl text-muted-foreground">
            Climb the ranks by submitting and refining groundbreaking ideas
          </p>
        </motion.div>

        {/* User Stats Section */}
        <UserStats stats={currentUser.stats} />

        {/* Filters and Search Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedTimeframe}
                onValueChange={(value) => setSelectedTimeframe(value as typeof timeframes[number])}
              >
                <SelectTrigger className="w-[180px] h-12">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Advanced Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setAdvancedFilters(prev => ({
                        ...prev,
                        minLevel: prev.minLevel === 'all' ? 'Visionary' : 'all'
                      }))}
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      <span>Visionary Only</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAdvancedFilters(prev => ({
                        ...prev,
                        minIdeas: prev.minIdeas === 0 ? 10 : 0
                      }))}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      <span>Min 10 Ideas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAdvancedFilters(prev => ({
                        ...prev,
                        minFeedback: prev.minFeedback === 0 ? 20 : 0
                      }))}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Min 20 Feedback</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setAdvancedFilters(prev => ({
                      ...prev,
                      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
                    }))}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>Sort {advancedFilters.sortOrder === 'desc' ? 'Ascending' : 'Descending'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setAdvancedFilters({
                      minLevel: 'all',
                      minIdeas: 0,
                      minFeedback: 0,
                      sortOrder: 'desc'
                    })}
                  >
                    Reset Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                onClick={() => setSortBy(option)}
                size="sm"
                className="h-8"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-muted animate-pulse"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredData.map((user, index) => (
                  <LeaderboardCard
                    key={user.id}
                    rank={index + 1}
                    user={user}
                    isTopThree={index < 3}
                    isCurrentUser={user.id === currentUser.id}
                    onClick={() => handleUserClick(user)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Current User Rank Card */}
        <UserRankCard
          rank={currentUser.rank}
          points={currentUser.points}
          progressToTop10={currentUser.progressToTop10}
          onTipClick={handleTipClick}
        />

        {/* User Profile Modal */}
        {selectedUser && (
          <UserProfileModal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            user={selectedUser}
            isCurrentUser={selectedUser.id === currentUser.id}
          />
        )}
      </div>
    </div>
  );
} 