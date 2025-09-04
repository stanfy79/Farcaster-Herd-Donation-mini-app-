"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Users, Activity, TrendingUp } from "lucide-react"
import { useExecutionHistory } from "@/hooks/use-execution-history"

export function CommunityStats() {
  const { historyData, loading, error } = useExecutionHistory()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Impact</CardTitle>
          <CardDescription>Loading community statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !historyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Impact</CardTitle>
          <CardDescription>Failed to load community stats</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "Unknown error"}</p>
        </CardContent>
      </Card>
    )
  }

  const getStepName = (stepNumber: string) => {
    switch (stepNumber) {
      case "1":
        return "Approvals"
      case "2":
        return "Donations"
      case "3":
        return "Refunds"
      default:
        return `Step ${stepNumber}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Community Impact
        </CardTitle>
        <CardDescription>See how the community is contributing to the Nigeria Farcaster fund</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-lg font-semibold">{historyData.totalWallets}</p>
              <p className="text-xs text-muted-foreground">Contributors</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <Activity className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-lg font-semibold">{historyData.totalTransactions}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
          </div>
        </div>

        {/* Step Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Activity by Step</h4>
          <div className="space-y-2">
            {Object.entries(historyData.stepStats).map(([stepNumber, stats]) => (
              <div key={stepNumber} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getStepName(stepNumber)}
                  </Badge>
                  <span className="text-sm">{stats.wallets} users</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.transactions} txns</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
