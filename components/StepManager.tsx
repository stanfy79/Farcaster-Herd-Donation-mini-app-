"use client"

import { useCrowdfundData } from "@/hooks/use-crowdfund-data"
import { Step1Approval } from "./Step1Approval"
import { Step2Donation } from "./Step2Donation"
import { Step3Refund } from "./Step3Refund"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Loader2 } from "lucide-react"

export function StepManager() {
  const { executionData, loading, refreshUserData, refreshData } = useCrowdfundData()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donation Steps</CardTitle>
          <CardDescription>Loading execution history...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!executionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donation Steps</CardTitle>
          <CardDescription>Failed to load execution data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Donation Process</h2>
        <p className="text-sm text-muted-foreground">Follow these steps to contribute to the Nigeria Farcaster fund</p>
      </div>

      {/* Step 1: USDC Approval */}
      <Step1Approval
        isCompleted={executionData.completedSteps.includes(1)}
        canExecute={executionData.canExecuteStep(1)}
        onComplete={refreshUserData}
      />

      <Step2Donation
        isCompleted={executionData.completedSteps.includes(2)}
        canExecute={executionData.canExecuteStep(2)}
        onComplete={refreshData}
      />

      <Step3Refund
        isCompleted={executionData.completedSteps.includes(3)}
        canExecute={executionData.canExecuteStep(3)}
        onComplete={refreshData}
      />
    </div>
  )
}
