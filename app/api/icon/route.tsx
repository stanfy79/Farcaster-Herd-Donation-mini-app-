import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          borderRadius: "50%",
          width: "85%",
          height: "85%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🇳🇬
        </div>
      </div>
      {/* Subtle corner accent */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "20%",
          height: "20%",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
        }}
      />
    </div>,
    {
      width: 1024,
      height: 1024,
    },
  )
}
