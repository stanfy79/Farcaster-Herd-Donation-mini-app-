import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 60,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Inter, sans-serif",
        padding: "60px",
        position: "relative",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
        }}
      />

      {/* Main content */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
        <div style={{ fontSize: 120, marginRight: "20px" }}>🇳🇬</div>
        <div style={{ fontSize: 80, marginRight: "20px" }}>💜</div>
        <div style={{ fontSize: 100 }}>🟣</div>
      </div>

      <div style={{ fontSize: 52, fontWeight: "bold", textAlign: "center", marginBottom: "15px", lineHeight: 1.2 }}>
        Farcaster Nigeria
      </div>
      <div style={{ fontSize: 36, textAlign: "center", opacity: 0.9, marginBottom: "25px" }}>Onboarding Fund</div>
      <div style={{ fontSize: 24, textAlign: "center", opacity: 0.8, maxWidth: "600px", lineHeight: 1.3 }}>
        Help Nigerians join the Farcaster community by contributing to their onboarding fees
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 18,
          opacity: 0.7,
        }}
      >
        Powered by Herd • Built with v0
      </div>
    </div>,
    {
      width: 1200,
      height: 800,
    },
  )
}
