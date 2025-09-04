"use client"

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"
import { useAccount, useConnect } from "wagmi"
import { config } from "./Web3Provider"
import { sdk } from "@farcaster/miniapp-sdk"
import type { Context } from "@farcaster/miniapp-sdk"
import { Button } from "./ui/button"

export function FarcasterConnect() {
  const { address, status } = useAccount()
  const { connect } = useConnect()
  const [context, setContext] = useState<Context | null>(null)

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const context = await sdk.context
        console.log(context, "context")
        setContext(context)
      } catch (error) {
        console.error("Failed to fetch Farcaster context:", error)
      }
    }
    fetchContext()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      {status === "connected" && address ? (
        <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-sm">
            <div className="font-medium">@{context?.user.username || "Unknown"}</div>
            <div className="text-muted-foreground text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => connect({ connector: config.connectors[0] })}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Wallet className="w-4 h-4" />
          Connect Farcaster
        </Button>
      )}
    </div>
  )
}
