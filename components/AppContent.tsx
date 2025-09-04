"use client"

import { useState, useEffect } from "react"
import { useAccount, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { sdk } from "@farcaster/miniapp-sdk"
import { FarcasterConnect } from "./FarcasterConnect"
import { CrowdfundProgress } from "./CrowdfundProgress"
import { StepManager } from "./StepManager"
import { CommunityStats } from "./CommunityStats"
import { RecentActivity } from "./RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const { address, status } = useAccount()
  const { switchChain } = useSwitchChain()

  // Switch to Base chain when connected
  useEffect(() => {
    if (status === "connected") {
      switchChain({ chainId: base.id })
    }
  }, [switchChain, address, status])

  // Call sdk.actions.ready() when app is ready
  useEffect(() => {
    if (!isAppReady) {
      const markAppReady = async () => {
        try {
          await sdk.actions.ready()
          setIsAppReady(true)
          console.log("App marked as ready!")
        } catch (error) {
          console.error("Failed to mark app as ready:", error)
          setIsAppReady(true) // Still mark as ready to prevent infinite loading
        }
      }

      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        markAppReady()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isAppReady])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Farcaster Nigeria Onboarding</h1>
          <p className="text-muted-foreground text-balance">
            Help Nigerians join Farcaster by contributing to their onboarding fees
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect with Farcaster to start contributing</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <FarcasterConnect />
          </CardContent>
        </Card>

        {/* Crowdfund Progress */}
        <div className="mb-6">
          <CrowdfundProgress />
        </div>

        {status === "connected" ? (
          <Tabs defaultValue="contribute" className="mb-20">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contribute">Contribute</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="contribute" className="space-y-4">
              <StepManager />
            </TabsContent>

            <TabsContent value="community" className="space-y-4">
              <CommunityStats />
              <RecentActivity />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mb-20 space-y-4">
            <CommunityStats />
            <RecentActivity />
          </div>
        )}

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t py-2">
          <p className="text-center text-xs text-muted-foreground">Powered by Herd</p>
        </div>
      </div>
    </div>
  )
}
