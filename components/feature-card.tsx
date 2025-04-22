"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  onClick?: () => void
}

export default function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(124, 58, 237, 0.5)" }}
      className="bg-[#1a1f38]/80 backdrop-blur-sm border border-purple-900/50 rounded-lg p-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4 text-purple-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-purple-300">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}
