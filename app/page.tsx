import { Web3Provider } from "@/components/Web3Provider"
import { AppContent } from "@/components/AppContent"

// Reference link for trail details and debugging help:
// https://trails-api.herd.eco/v1/trails/0198e7be-801e-7a01-b50d-f7a23b0dbb79/versions/0198e7be-802a-71ab-b851-93de86d73cfe/guidebook.txt?promptObject=farcaster_miniapp&trailAppId=0198e82f-c0a8-70d1-82e8-8eaa8cfb369e

export default function Home() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  )
}
