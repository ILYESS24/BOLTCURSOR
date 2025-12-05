"use client"

import { useEffect, useState } from "react"
import { GrainGradient } from "@paper-design/shaders-react"

export function GradientBackground() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Rendu côté serveur - gradient CSS temporaire
    return (
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="w-full h-full bg-gradient-to-br from-orange-400 via-yellow-400 to-pink-500 opacity-20 animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 -z-10">
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        colorBack="hsl(0, 0%, 0%)"
        softness={0.76}
        intensity={0.45}
        noise={0}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={1}
        colors={["hsl(14, 100%, 57%)", "hsl(45, 100%, 51%)", "hsl(340, 82%, 52%)"]}
      />
    </div>
  )
}
