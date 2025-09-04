"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ExternalLink, Clock } from "lucide-react"
import { useExecutionHistory } from "@/hooks/use-execution-history"

export function RecentActivity() {
  const { historyData, loading, error } = useExecutionHistory()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading recent transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </div>
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
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Failed to load recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "Unknown error"}</p>
        </CardContent>
      </Card>
    )
  }

  const getStepAction = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return { action: "approved USDC", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }
      case 2:
        return {
          action: "made a donation",
          color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        }
      case 3:
        return {
          action: "claimed refund",
          color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        }
      default:
        return { action: "completed step", color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" }
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000
    const diff = now - timestamp

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  // Determine step number from transaction context (this is a simplified approach)
  const getStepFromContext = (tx: any) => {
    // In a real implementation, you'd need to analyze the transaction or have step info
    // For now, we'll assume step 2 (donations) for most transactions
    return 2
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest contributions from the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {historyData.recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            historyData.recentTransactions.map((tx, index) => {
              const stepNumber = getStepFromContext(tx)
              const stepInfo = getStepAction(stepNumber)

              return (
                <div
                  key={`${tx.txHash}-${index}`}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={tx.farcasterData?.pfp_url || "/placeholder.svg"}
                      alt={tx.farcasterData?.username || "User"}
                    />
                    <AvatarFallback className="text-xs">
                      {tx.farcasterData?.username?.[0]?.toUpperCase() || tx.walletAddress.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {tx.farcasterData?.username
                          ? `@${tx.farcasterData.username}`
                          : `${tx.walletAddress.slice(0, 6)}...${tx.walletAddress.slice(-4)}`}
                      </span>
                      <Badge variant="secondary" className={`text-xs ${stepInfo.color}`}>
                        {stepInfo.action}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(tx.blockTimestamp)}</span>
                      <a
                        href={`https://herd.eco/base/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
