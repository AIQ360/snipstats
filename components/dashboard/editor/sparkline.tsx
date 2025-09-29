"use client"

import { useRef, useEffect } from "react"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  lineWidth?: number
  fillOpacity?: number
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "#10B981",
  lineWidth = 1.5,
  fillOpacity = 0.2,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (data.length === 0) return

    // Find min and max values
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Avoid division by zero

    // Calculate x and y coordinates
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * height,
    }))

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.stroke()

    // Fill the area under the line
    ctx.lineTo(points[points.length - 1].x, height)
    ctx.lineTo(points[0].x, height)
    ctx.closePath()

    ctx.fillStyle = `${color}${Math.round(fillOpacity * 255)
      .toString(16)
      .padStart(2, "0")}`
    ctx.fill()
  }, [data, width, height, color, lineWidth, fillOpacity])

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
}
