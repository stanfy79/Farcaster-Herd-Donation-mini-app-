"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { CheckCircle, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { useCrowdfundData } from "@/hooks/use-crowdfund-data"
import { useTrailTransaction } from "@/hooks/use-transaction"
import { Alert, AlertDescription } from "./ui/alert"

interface Step1ApprovalProps {
  isCompleted: boolean
  canExecute: boolean
  onComplete: () => void
}

export function Step1Approval({ isCompleted, canExecute, onComplete }: Step1ApprovalProps) {
  const { userData, crowdfundData, refreshUserData } = useCrowdfundData()
  const { executeStep, submitExecutionForHash, isSubmitting, txError, lastTxHash } = useTrailTransaction()
  const [approvalAmount, setApprovalAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Primary node ID for Step 1 (USDC approval)
  const PRIMARY_NODE_ID = "0198e7be-802f-7f65-84bb-ea80d19a5ebc"

  // Handle transaction hash submission
  useEffect(() => {
    if (lastTxHash && !isCompleted) {
      submitExecutionForHash(lastTxHash, PRIMARY_NODE_ID, () => {
        refreshUserData()
        onComplete()
      })
    }
  }, [lastTxHash, isCompleted, submitExecutionForHash, refreshUserData, onComplete])

  const handleApprove = async () => {
    if (!approvalAmount || !userData) return

    const amount = Number.parseFloat(approvalAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (amount > userData.usdcBalance) {
      setError("Amount exceeds your USDC balance")
      return
    }

    setError(null)

    try {
      // Prepare user inputs for the approval step
      const userInputs = {
        [PRIMARY_NODE_ID]: {
          "inputs.value": {
            value: amount.toString(), // Don't multiply by decimals - already applied
          },
        },
      }

      await executeStep(1, PRIMARY_NODE_ID, userInputs, () => {
        refreshUserData()
        onComplete()
      })
    } catch (err) {
      console.error("Failed to execute approval:", err)
      setError(err instanceof Error ? err.message : "Failed to execute approval")
    }
  }

  const handleMaxAmount = () => {
    if (userData) {
      setApprovalAmount(userData.usdcBalance.toString())
    }
  }

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-700 dark:text-green-300">Step 1: USDC Approval</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Completed
            </Badge>
          </div>
          <CardDescription className="text-green-600 dark:text-green-400">
            USDC spending approved successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <DollarSign className="w-4 h-4" />
            <span>Current allowance: ${userData?.usdcAllowance.toFixed(2) || "0.00"} USDC</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canExecute) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Step 1: USDC Approval</CardTitle>
          <CardDescription>Complete previous steps first</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This step will be available after completing previous steps.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <CardTitle>USDC Approval</CardTitle>
          <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
            Active
          </Badge>
        </div>
        <CardDescription>
          Approve USDC spending to enable donations. This allows the crowdfund contract to transfer your USDC.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Balance Info */}
        {userData && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your USDC Balance:</span>
              <span className="font-medium">${userData.usdcBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Allowance:</span>
              <span className="font-medium">${userData.usdcAllowance.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="approval-amount">Approval Amount (USDC)</Label>
          <div className="flex gap-2">
            <Input
              id="approval-amount"
              type="number"
              placeholder="0.00"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            <Button variant="outline" onClick={handleMaxAmount} disabled={isSubmitting || !userData}>
              Max
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This amount will be approved for the crowdfund contract to spend on your behalf.
          </p>
        </div>

        {/* Error Display */}
        {(error || txError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || txError?.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button
          onClick={handleApprove}
          disabled={!approvalAmount || isSubmitting || !userData || !crowdfundData?.isActive}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Approve USDC
            </>
          )}
        </Button>

        {!crowdfundData?.isActive && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This crowdfund is no longer active for new donations.</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This transaction approves the crowdfund contract to spend your USDC</p>
          <p>• You can approve any amount up to your balance</p>
          <p>• This is required before you can make donations</p>
        </div>
      </CardContent>
    </Card>
  )
}
