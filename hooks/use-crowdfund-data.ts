"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import {
  getCrowdfundDetails,
  getDonorsCount,
  getUserUSDCBalance,
  getUserUSDCAllowance,
  getUserDonationAmount,
  getExecutionHistory,
  parseCrowdfundData,
  formatUSDC,
  isCrowdfundActive,
  isGoalReached,
} from "@/lib/trail-api"

export interface CrowdfundData {
  goal: number
  totalRaised: number
  endTimestamp: number
  creator: string
  fundsClaimed: boolean
  cancelled: boolean
  isActive: boolean
  isGoalReached: boolean
  donorsCount: number
  progressPercentage: number
}

export interface UserData {
  usdcBalance: number
  usdcAllowance: number
  donationAmount: number
  hasAllowance: boolean
  canDonate: boolean
}

export interface ExecutionData {
  currentStep: number
  completedSteps: number[]
  canExecuteStep: (step: number) => boolean
}

export function useCrowdfundData() {
  const { address } = useAccount()
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [executionData, setExecutionData] = useState<ExecutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch crowdfund data (public data)
  const fetchCrowdfundData = async () => {
    try {
      const [crowdfundResponse, donorsResponse] = await Promise.all([getCrowdfundDetails(), getDonorsCount()])

      const crowdfund = parseCrowdfundData(crowdfundResponse)
      if (!crowdfund) throw new Error("Failed to parse crowdfund data")

      const donorsCount = Number(donorsResponse.outputs?.arg_0?.value || 0)

      const data: CrowdfundData = {
        ...crowdfund,
        isActive: isCrowdfundActive(crowdfund.endTimestamp),
        isGoalReached: isGoalReached(crowdfund.totalRaised, crowdfund.goal),
        donorsCount,
        progressPercentage: Math.min((crowdfund.totalRaised / crowdfund.goal) * 100, 100),
      }

      setCrowdfundData(data)
    } catch (err) {
      console.error("Failed to fetch crowdfund data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch crowdfund data")
    }
  }

  // Fetch user-specific data
  const fetchUserData = async () => {
    if (!address) {
      setUserData(null)
      return
    }

    try {
      const [balanceResponse, allowanceResponse, donationResponse] = await Promise.all([
        getUserUSDCBalance(address),
        getUserUSDCAllowance(address),
        getUserDonationAmount(address),
      ])

      const usdcBalance = formatUSDC(balanceResponse.outputs?.arg_0?.value || 0)
      const usdcAllowance = formatUSDC(allowanceResponse.outputs?.arg_0?.value || 0)
      const donationAmount = formatUSDC(donationResponse.outputs?.arg_0?.value || 0)

      const data: UserData = {
        usdcBalance,
        usdcAllowance,
        donationAmount,
        hasAllowance: usdcAllowance > 0,
        canDonate: usdcBalance > 0 && crowdfundData?.isActive === true,
      }

      setUserData(data)
    } catch (err) {
      console.error("Failed to fetch user data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch user data")
    }
  }

  // Fetch execution history
  const fetchExecutionData = async () => {
    if (!address) {
      setExecutionData(null)
      return
    }

    try {
      const historyResponse = await getExecutionHistory([address])
      const walletExecution = historyResponse.walletExecutions?.[0]

      if (!walletExecution) {
        setExecutionData({
          currentStep: 1,
          completedSteps: [],
          canExecuteStep: (step: number) => step === 1,
        })
        return
      }

      const latestExecution = walletExecution.executions?.[0]
      const completedSteps =
        latestExecution?.steps
          ?.filter((step: any) => step.stepNumber > 0) // Filter out step 0
          ?.map((step: any) => step.stepNumber) || []

      const currentStep = completedSteps.length > 0 ? Math.max(...completedSteps) + 1 : 1

      const data: ExecutionData = {
        currentStep: Math.min(currentStep, 3), // Max 3 steps
        completedSteps,
        canExecuteStep: (step: number) => {
          if (step === 1) return true // Can always start with step 1
          if (step === 2) return completedSteps.includes(1) // Need step 1 for step 2
          if (step === 3) return completedSteps.includes(2) // Need step 2 for step 3
          return false
        },
      }

      setExecutionData(data)
    } catch (err) {
      console.error("Failed to fetch execution data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch execution data")
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      setError(null)

      await fetchCrowdfundData()
      if (address) {
        await Promise.all([fetchUserData(), fetchExecutionData()])
      }

      setLoading(false)
    }

    fetchAllData()
  }, [address])

  // Refresh functions
  const refreshData = async () => {
    await fetchCrowdfundData()
    if (address) {
      await Promise.all([fetchUserData(), fetchExecutionData()])
    }
  }

  const refreshUserData = async () => {
    if (address) {
      await Promise.all([fetchUserData(), fetchExecutionData()])
    }
  }

  return {
    crowdfundData,
    userData,
    executionData,
    loading,
    error,
    refreshData,
    refreshUserData,
  }
}
