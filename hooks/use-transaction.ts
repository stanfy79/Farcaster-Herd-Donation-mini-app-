"use client"

import { useState } from "react"
import { useAccount, useSendTransaction } from "wagmi"
import { getStepEvaluation, submitExecution } from "@/lib/trail-api"

export function useTrailTransaction() {
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  const {
    sendTransaction,
    isPending: isTxPending,
    error: txError,
  } = useSendTransaction({
    mutation: {
      onSuccess: async (hash: string) => {
        console.log("[v0] Transaction successfully sent:", hash)
        setLastTxHash(hash)
      },
      onError: (error: Error) => {
        console.error("[v0] Transaction failed:", error)
        setIsSubmitting(false)
      },
    },
  })

  const executeStep = async (
    stepNumber: number,
    primaryNodeId: string,
    userInputs: Record<string, Record<string, { value: string }>>,
    onSuccess?: () => void,
  ) => {
    if (!address) {
      throw new Error("Wallet not connected")
    }

    setIsSubmitting(true)

    try {
      // Get evaluation data from Trail API
      console.log("[v0] Getting evaluation for step:", stepNumber)
      const evaluation = await getStepEvaluation(stepNumber, address, userInputs)

      // Create transaction request
      const transactionRequest = {
        from: address as `0x${string}`,
        to: evaluation.contractAddress as `0x${string}`,
        data: evaluation.callData as `0x${string}`,
        value: BigInt(evaluation.payableAmount ?? "0"),
      }

      console.log("[v0] Sending transaction:", transactionRequest)

      // Send transaction - success handling is in the useSendTransaction callback
      sendTransaction(transactionRequest)

      // Wait for transaction hash and submit to executions API
      // This will be handled by the onSuccess callback above
      const submitToExecutions = async (hash: string) => {
        try {
          console.log("[v0] Submitting execution to API:", { primaryNodeId, hash })
          await submitExecution(primaryNodeId, hash, address)
          onSuccess?.()
        } catch (err) {
          console.error("[v0] Failed to submit execution:", err)
          // Still call onSuccess since the transaction went through
          onSuccess?.()
        } finally {
          setIsSubmitting(false)
        }
      }

      // Set up a listener for when the transaction hash is available
      if (lastTxHash) {
        await submitToExecutions(lastTxHash)
      }
    } catch (error) {
      console.error("[v0] Failed to execute step:", error)
      setIsSubmitting(false)
      throw error
    }
  }

  // Submit execution when we get a new transaction hash
  const submitExecutionForHash = async (hash: string, primaryNodeId: string, onSuccess?: () => void) => {
    if (!address) return

    try {
      console.log("[v0] Submitting execution to API:", { primaryNodeId, hash })
      await submitExecution(primaryNodeId, hash, address)
      onSuccess?.()
    } catch (err) {
      console.error("[v0] Failed to submit execution:", err)
      // Still call onSuccess since the transaction went through
      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    executeStep,
    submitExecutionForHash,
    isSubmitting: isSubmitting || isTxPending,
    txError,
    lastTxHash,
  }
}
