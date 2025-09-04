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
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          width: "70%",
          height: "70%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 90,
          boxShadow: "0 0 40px rgba(255, 255, 255, 0.3)",
          border: "3px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        🇳🇬
      </div>

      {/* Pulsing rings for animation effect */}
      <div
        style={{
          position: "absolute",
          width: "80%",
          height: "80%",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "90%",
          height: "90%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
        }}
      />
    </div>,
    {
      width: 200,
      height: 200,
    },
  )
}
