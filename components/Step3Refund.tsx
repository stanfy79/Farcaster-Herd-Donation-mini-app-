"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { CheckCircle, RefreshCw, Loader2, AlertCircle, Clock } from "lucide-react"
import { useCrowdfundData } from "@/hooks/use-crowdfund-data"
import { useTrailTransaction } from "@/hooks/use-transaction"
import { Alert, AlertDescription } from "./ui/alert"

interface Step3RefundProps {
  isCompleted: boolean
  canExecute: boolean
  onComplete: () => void
}

export function Step3Refund({ isCompleted, canExecute, onComplete }: Step3RefundProps) {
  const { userData, crowdfundData, refreshData } = useCrowdfundData()
  const { executeStep, submitExecutionForHash, isSubmitting, txError, lastTxHash } = useTrailTransaction()
  const [error, setError] = useState<string | null>(null)

  // Primary node ID for Step 3 (Claim Refund)
  const PRIMARY_NODE_ID = "0198e7be-8032-75da-9c00-27872be8e732"

  // Handle transaction hash submission
  useEffect(() => {
    if (lastTxHash && !isCompleted) {
      submitExecutionForHash(lastTxHash, PRIMARY_NODE_ID, () => {
        refreshData()
        onComplete()
      })
    }
  }, [lastTxHash, isCompleted, submitExecutionForHash, refreshData, onComplete])

  // Check if refunds are available
  const isRefundAvailable = () => {
    if (!crowdfundData || !userData) return false

    // Refunds are available if:
    // 1. Crowdfund has ended
    // 2. Goal was not reached
    // 3. User has made donations
    return (
      !crowdfundData.isActive && !crowdfundData.isGoalReached && userData.donationAmount > 0 && !crowdfundData.cancelled
    )
  }

  const handleClaimRefund = async () => {
    if (!userData || !crowdfundData) return

    if (!isRefundAvailable()) {
      setError("Refunds are not available for this crowdfund")
      return
    }

    if (userData.donationAmount === 0) {
      setError("You have no donations to refund")
      return
    }

    setError(null)

    try {
      // No user inputs required for refund - all inputs are hardcoded
      const userInputs = {}

      await executeStep(3, PRIMARY_NODE_ID, userInputs, () => {
        refreshData()
        onComplete()
      })
    } catch (err) {
      console.error("Failed to execute refund:", err)
      setError(err instanceof Error ? err.message : "Failed to execute refund")
    }
  }

  const getRefundStatus = () => {
    if (!crowdfundData || !userData) return null

    if (crowdfundData.isActive) {
      return {
        type: "waiting",
        message: "Crowdfund is still active. Refunds will be available if the goal is not reached by the end date.",
      }
    }

    if (crowdfundData.isGoalReached) {
      return {
        type: "success",
        message: "Crowdfund succeeded! Your donation helped reach the goal. No refunds needed.",
      }
    }

    if (crowdfundData.cancelled) {
      return {
        type: "cancelled",
        message: "Crowdfund was cancelled. Refunds should be available.",
      }
    }

    if (userData.donationAmount === 0) {
      return {
        type: "no-donations",
        message: "You haven't made any donations to this crowdfund.",
      }
    }

    return {
      type: "available",
      message: "Crowdfund ended without reaching its goal. You can claim a refund of your donations.",
    }
  }

  const refundStatus = getRefundStatus()

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-700 dark:text-green-300">Step 3: Refund Claimed</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Completed
            </Badge>
          </div>
          <CardDescription className="text-green-600 dark:text-green-400">
            Your refund has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <RefreshCw className="w-4 h-4" />
            <span>Refunded: ${userData?.donationAmount.toFixed(2) || "0.00"} USDC</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canExecute) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Step 3: Claim Refund</CardTitle>
          <CardDescription>Available if crowdfund fails to reach its goal</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This step will be available if the crowdfund ends without reaching its goal and you have made donations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`${
        isRefundAvailable()
          ? "border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800"
          : "border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800"
      }`}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 ${
              isRefundAvailable() ? "bg-orange-600" : "bg-gray-600"
            } text-white rounded-full flex items-center justify-center text-sm font-bold`}
          >
            3
          </div>
          <CardTitle>Claim Refund</CardTitle>
          <Badge
            variant="outline"
            className={
              isRefundAvailable()
                ? "border-orange-300 text-orange-700 dark:text-orange-300"
                : "border-gray-300 text-gray-700 dark:text-gray-300"
            }
          >
            {isRefundAvailable() ? "Available" : "Waiting"}
          </Badge>
        </div>
        <CardDescription>Claim a refund of your donations if the crowdfund doesn't reach its goal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Donation Info */}
        {userData && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Total Donations:</span>
              <span className="font-medium">${userData.donationAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Refundable Amount:</span>
              <span className="font-medium">${isRefundAvailable() ? userData.donationAmount.toFixed(2) : "0.00"}</span>
            </div>
          </div>
        )}

        {/* Crowdfund Status */}
        {crowdfundData && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Goal Progress:</span>
              <span className="font-medium">{crowdfundData.progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {crowdfundData.isActive ? "Active" : crowdfundData.isGoalReached ? "Successful" : "Failed"}
              </span>
            </div>
          </div>
        )}

        {/* Status Message */}
        {refundStatus && (
          <Alert variant={refundStatus.type === "available" ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {refundStatus.type === "waiting" && <Clock className="h-4 w-4" />}
              {refundStatus.type === "available" && <RefreshCw className="h-4 w-4" />}
              {refundStatus.type === "success" && <CheckCircle className="h-4 w-4" />}
              {(refundStatus.type === "cancelled" || refundStatus.type === "no-donations") && (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <AlertDescription>{refundStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {(error || txError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || txError?.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button
          onClick={handleClaimRefund}
          disabled={!isRefundAvailable() || isSubmitting || !userData || userData.donationAmount === 0}
          className={`w-full ${
            isRefundAvailable() ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Refund...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isRefundAvailable()
                ? `Claim $${userData?.donationAmount.toFixed(2) || "0.00"} Refund`
                : "Refund Not Available"}
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Refunds are only available if the crowdfund fails to reach its goal</p>
          <p>• You can only claim refunds for donations you made to this crowdfund</p>
          <p>• Refunds are processed immediately on the blockchain</p>
        </div>
      </CardContent>
    </Card>
  )
}
