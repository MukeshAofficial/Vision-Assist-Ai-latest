"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function GlowEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isVisible])

  return (
    <>
      {/* Static glow effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      {/* Mouse-following glow */}
      {isVisible && (
        <motion.div
          className="fixed w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none z-0"
          animate={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
          }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
        />
      )}
    </>
  )
}
