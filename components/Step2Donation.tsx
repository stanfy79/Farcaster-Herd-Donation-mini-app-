"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { CheckCircle, Heart, Loader2, AlertCircle } from "lucide-react"
import { useCrowdfundData } from "@/hooks/use-crowdfund-data"
import { useTrailTransaction } from "@/hooks/use-transaction"
import { Alert, AlertDescription } from "./ui/alert"

interface Step2DonationProps {
  isCompleted: boolean
  canExecute: boolean
  onComplete: () => void
}

export function Step2Donation({ isCompleted, canExecute, onComplete }: Step2DonationProps) {
  const { userData, crowdfundData, refreshData } = useCrowdfundData()
  const { executeStep, submitExecutionForHash, isSubmitting, txError, lastTxHash } = useTrailTransaction()
  const [donationAmount, setDonationAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Primary node ID for Step 2 (Donation)
  const PRIMARY_NODE_ID = "0198e7be-802e-7b36-9ba8-090630b25e2b"

  // Handle transaction hash submission
  useEffect(() => {
    if (lastTxHash && !isCompleted) {
      submitExecutionForHash(lastTxHash, PRIMARY_NODE_ID, () => {
        refreshData()
        onComplete()
      })
    }
  }, [lastTxHash, isCompleted, submitExecutionForHash, refreshData, onComplete])

  const handleDonate = async () => {
    if (!donationAmount || !userData || !crowdfundData) return

    const amount = Number.parseFloat(donationAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid donation amount")
      return
    }

    if (amount > userData.usdcBalance) {
      setError("Amount exceeds your USDC balance")
      return
    }

    if (amount > userData.usdcAllowance) {
      setError("Amount exceeds your approved allowance. Please increase your approval in Step 1.")
      return
    }

    if (!crowdfundData.isActive) {
      setError("This crowdfund is no longer active")
      return
    }

    setError(null)

    try {
      // Prepare user inputs for the donation step
      const userInputs = {
        [PRIMARY_NODE_ID]: {
          "inputs.amount": {
            value: amount.toString(), // Don't multiply by decimals - already applied
          },
        },
      }

      await executeStep(2, PRIMARY_NODE_ID, userInputs, () => {
        refreshData()
        onComplete()
      })
    } catch (err) {
      console.error("Failed to execute donation:", err)
      setError(err instanceof Error ? err.message : "Failed to execute donation")
    }
  }

  const handleMaxAmount = () => {
    if (userData) {
      // Use the minimum of balance and allowance
      const maxAmount = Math.min(userData.usdcBalance, userData.usdcAllowance)
      setDonationAmount(maxAmount.toString())
    }
  }

  const calculateImpact = () => {
    if (!donationAmount || !crowdfundData) return null
    const amount = Number.parseFloat(donationAmount)
    if (isNaN(amount)) return null

    const newTotal = crowdfundData.totalRaised + amount
    const newProgress = Math.min((newTotal / crowdfundData.goal) * 100, 100)
    const progressIncrease = newProgress - crowdfundData.progressPercentage

    return {
      newTotal,
      newProgress,
      progressIncrease,
    }
  }

  const impact = calculateImpact()

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-700 dark:text-green-300">Step 2: Donation</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Completed
            </Badge>
          </div>
          <CardDescription className="text-green-600 dark:text-green-400">
            Thank you for your contribution!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <Heart className="w-4 h-4" />
            <span>Your donation: ${userData?.donationAmount.toFixed(2) || "0.00"} USDC</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canExecute) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Step 2: Make Donation</CardTitle>
          <CardDescription>Complete Step 1 (USDC Approval) first</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to approve USDC spending before you can make a donation.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          <CardTitle>Make Donation</CardTitle>
          <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
            Active
          </Badge>
        </div>
        <CardDescription>
          Contribute USDC to help Nigerians join Farcaster. Your donation will help cover onboarding fees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Balance & Allowance Info */}
        {userData && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available to Donate:</span>
              <span className="font-medium">${Math.min(userData.usdcBalance, userData.usdcAllowance).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Previous Donations:</span>
              <span className="font-medium">${userData.donationAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Donation Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="donation-amount">Donation Amount (USDC)</Label>
          <div className="flex gap-2">
            <Input
              id="donation-amount"
              type="number"
              placeholder="0.00"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            <Button variant="outline" onClick={handleMaxAmount} disabled={isSubmitting || !userData}>
              Max
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the amount you want to donate to help Nigerians join Farcaster.
          </p>
        </div>

        {/* Impact Preview */}
        {impact && (
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Your Impact</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-600 dark:text-purple-400">New Total Raised:</span>
                <span className="font-medium">${impact.newTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600 dark:text-purple-400">Progress Increase:</span>
                <span className="font-medium">+{impact.progressIncrease.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(error || txError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || txError?.message}</AlertDescription>
          </Alert>
        )}

        {/* Insufficient Allowance Warning */}
        {userData && userData.usdcAllowance === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You need to complete Step 1 (USDC Approval) before you can donate.</AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button
          onClick={handleDonate}
          disabled={
            !donationAmount || isSubmitting || !userData || !crowdfundData?.isActive || userData.usdcAllowance === 0
          }
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Donating...
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Donate ${donationAmount || "0.00"}
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
          <p>• Your donation helps cover Farcaster onboarding fees for Nigerians</p>
          <p>• Donations are processed immediately on the blockchain</p>
          <p>• You can claim refunds if the crowdfund doesn't reach its goal</p>
        </div>
      </CardContent>
    </Card>
  )
}
