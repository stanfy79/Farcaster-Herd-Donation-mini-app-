"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { getExecutionHistory } from "@/lib/trail-api"

export interface TransactionData {
  walletAddress: string
  txHash: string
  blockTimestamp: number
  blockNumber: number
  latestExecutionId: string
  farcasterData: {
    username: string
    pfp_url: string
    display_name: string
    fid: string
    bio: string
  } | null
}

export interface StepStats {
  wallets: number
  transactions: number
  transactionHashes: TransactionData[]
}

export interface ExecutionHistoryData {
  totalTransactions: number
  totalWallets: number
  stepStats: Record<string, StepStats>
  recentTransactions: TransactionData[]
}

export function useExecutionHistory() {
  const { address } = useAccount()
  const [historyData, setHistoryData] = useState<ExecutionHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExecutionHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all execution history (no wallet filter for community stats)
      const response = await getExecutionHistory()

      // Process the response
      const totalTransactions = response.totals?.transactions || 0
      const totalWallets = response.totals?.wallets || 0
      const stepStats = response.totals?.stepStats || {}

      // Collect all recent transactions across all steps
      const allTransactions: TransactionData[] = []
      Object.values(stepStats).forEach((step: any) => {
        if (step.transactionHashes) {
          allTransactions.push(...step.transactionHashes)
        }
      })

      // Sort by block timestamp (most recent first)
      const recentTransactions = allTransactions.sort((a, b) => b.blockTimestamp - a.blockTimestamp).slice(0, 20) // Show last 20 transactions

      const data: ExecutionHistoryData = {
        totalTransactions,
        totalWallets,
        stepStats,
        recentTransactions,
      }

      setHistoryData(data)
    } catch (err) {
      console.error("Failed to fetch execution history:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch execution history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExecutionHistory()

    // Refresh every 30 seconds
    const interval = setInterval(fetchExecutionHistory, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    historyData,
    loading,
    error,
    refreshHistory: fetchExecutionHistory,
  }
}
