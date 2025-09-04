"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Clock, Users, Target } from "lucide-react"
import { useCrowdfundData } from "@/hooks/use-crowdfund-data"

export function CrowdfundProgress() {
  const { crowdfundData, loading, error } = useCrowdfundData()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crowdfund Progress</CardTitle>
          <CardDescription>Loading crowdfund data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded animate-pulse" />
              <div className="h-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !crowdfundData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crowdfund Progress</CardTitle>
          <CardDescription>Failed to load crowdfund data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "Unknown error"}</p>
        </CardContent>
      </Card>
    )
  }

  const timeLeft = Math.max(0, crowdfundData.endTimestamp - Date.now() / 1000)
  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60))
  const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🇳🇬</span>
              Nigeria Farcaster Fund
            </CardTitle>
            <CardDescription>Help Nigerians join the Farcaster community</CardDescription>
          </div>
          <Badge variant={crowdfundData.isActive ? "default" : "secondary"}>
            {crowdfundData.isActive ? "Active" : "Ended"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{crowdfundData.progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={crowdfundData.progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="font-medium">${crowdfundData.totalRaised.toFixed(2)} raised</span>
            <span className="text-muted-foreground">of ${crowdfundData.goal.toFixed(2)} goal</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{crowdfundData.donorsCount}</p>
              <p className="text-xs text-muted-foreground">Donors</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">{crowdfundData.isActive ? `${daysLeft}d ${hoursLeft}h` : "Ended"}</p>
              <p className="text-xs text-muted-foreground">Time left</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {crowdfundData.isGoalReached && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <Target className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-300">Goal reached! 🎉</p>
          </div>
        )}

        {!crowdfundData.isActive && !crowdfundData.isGoalReached && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
            <Clock className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-700 dark:text-orange-300">Campaign ended. Refunds may be available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
