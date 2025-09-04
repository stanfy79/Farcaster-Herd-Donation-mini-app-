// Trail API utilities for Farcaster Nigeria Onboarding Donation
// Trail ID: 0198e7be-801e-7a01-b50d-f7a23b0dbb79
// Version ID: 0198e7be-802a-71ab-b851-93de86d73cfe
// Trail App ID: 0198e82f-c0a8-70d1-82e8-8eaa8cfb369e

const TRAIL_ID = "0198e7be-801e-7a01-b50d-f7a23b0dbb79"
const VERSION_ID = "0198e7be-802a-71ab-b851-93de86d73cfe"
const TRAIL_APP_ID = "0198e82f-c0a8-70d1-82e8-8eaa8cfb369e"
const BASE_URL = "https://trails-api.herd.eco/v1"

const CROWDFUND_ID = "3368"
const USDC_CONTRACT = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
const CROWDFUND_CONTRACT = "0x016df4c52fb5c0e1cb3432ebd6071a90b1f6dcd9"

// Headers for all API requests
const getHeaders = () => ({
  "Content-Type": "application/json",
  "Herd-Trail-App-Id": TRAIL_APP_ID,
})

// Get transaction calldata for a step
export async function getStepEvaluation(
  stepNumber: number,
  walletAddress: string,
  userInputs: Record<string, Record<string, { value: string }>>,
  executionType: "latest" | "new" | { type: "manual"; executionId: string } = "latest",
) {
  console.log("[v0] Getting step evaluation:", { stepNumber, walletAddress, userInputs })

  const response = await fetch(
    `${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/steps/${stepNumber}/evaluations`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        walletAddress,
        userInputs,
        execution: typeof executionType === "string" ? { type: executionType } : executionType,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to get evaluation: ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[v0] Step evaluation response:", data)
  return data
}

// Submit transaction hash after execution
export async function submitExecution(
  nodeId: string,
  transactionHash: string,
  walletAddress: string,
  executionType: "latest" | "new" | { type: "manual"; executionId: string } = "latest",
) {
  console.log("[v0] Submitting execution:", { nodeId, transactionHash, walletAddress })

  const response = await fetch(`${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/executions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      nodeId,
      transactionHash,
      walletAddress,
      execution: typeof executionType === "string" ? { type: executionType } : executionType,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to submit execution: ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[v0] Execution submission response:", data)
  return data
}

// Query execution history
export async function getExecutionHistory(walletAddresses?: string[]) {
  console.log("[v0] Getting execution history for wallets:", walletAddresses)

  const response = await fetch(`${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/executions/query`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      walletAddresses: walletAddresses || [],
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get execution history: ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[v0] Execution history response:", data)
  return data
}

// Read node data
export async function readNodeData(
  nodeId: string,
  walletAddress: string,
  userInputs: Record<string, Record<string, { value: string }>> = {},
  executionId?: string,
) {
  console.log("[v0] Reading node data:", { nodeId, walletAddress, userInputs, executionId })

  const response = await fetch(`${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/nodes/${nodeId}/read`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      walletAddress,
      userInputs,
      execution: executionId ? { type: "manual", executionId } : { type: "latest" },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to read node data: ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[v0] Node data response:", data)
  return data
}

// Specific read functions for this trail

// Get user's USDC balance
export async function getUserUSDCBalance(walletAddress: string) {
  const nodeId = "0198e7be-802e-7b36-9ba8-090782df1778" // FiatTokenV2_2.balanceOf
  return readNodeData(nodeId, walletAddress)
}

// Get user's USDC allowance for the crowdfund contract
export async function getUserUSDCAllowance(walletAddress: string) {
  const nodeId = "0198e7be-8032-75da-9c00-27853631a929" // FiatTokenV2_2.allowance
  return readNodeData(nodeId, walletAddress)
}

// Get crowdfund details (goal, totalRaised, endTimestamp, etc.)
export async function getCrowdfundDetails() {
  const nodeId = "0198e7be-8031-7bf8-a30f-2b97208986a3" // FarcasterCrowdfund.crowdfunds
  return readNodeData(nodeId, "0x0000000000000000000000000000000000000000") // Use null address for public data
}

// Get total number of donors
export async function getDonorsCount() {
  const nodeId = "0198e7be-8032-75da-9c00-2786802ccc9f" // FarcasterCrowdfund.getDonorsCount
  return readNodeData(nodeId, "0x0000000000000000000000000000000000000000") // Use null address for public data
}

// Get user's donation amount for this crowdfund
export async function getUserDonationAmount(walletAddress: string) {
  const nodeId = "0198e7be-802e-7b36-9ba8-0905c59c5cd8" // FarcasterCrowdfund.donations
  return readNodeData(nodeId, walletAddress)
}

// Helper function to format USDC amounts (6 decimals)
export function formatUSDC(rawAmount: string | number): number {
  return Number(rawAmount) / Math.pow(10, 6)
}

// Helper function to parse crowdfund data
export function parseCrowdfundData(data: any) {
  if (!data.outputs || !data.outputs.arg_0) return null

  const crowdfund = data.outputs.arg_0.value
  return {
    goal: formatUSDC(crowdfund[0].value), // goal in USDC
    totalRaised: formatUSDC(crowdfund[1].value), // totalRaised in USDC
    endTimestamp: Number(crowdfund[2].value), // endTimestamp as unix timestamp
    contentIdHash: crowdfund[3].value,
    creator: crowdfund[4].value,
    fundsClaimed: crowdfund[5].value,
    cancelled: crowdfund[6].value,
  }
}

// Helper function to check if crowdfund is active
export function isCrowdfundActive(endTimestamp: number): boolean {
  return Date.now() / 1000 < endTimestamp
}

// Helper function to check if crowdfund goal is reached
export function isGoalReached(totalRaised: number, goal: number): boolean {
  return totalRaised >= goal
}
