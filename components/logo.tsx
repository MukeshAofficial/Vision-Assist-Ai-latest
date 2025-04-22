"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Logo() {
  return (
    <Link href="/">
      <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-2">
          <motion.div
            className="w-4 h-4 rounded-full bg-white/90"
            animate={{
              boxShadow: ["0 0 0 0 rgba(255, 255, 255, 0.7)", "0 0 0 10px rgba(255, 255, 255, 0)"],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
            }}
          />
        </div>
        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Vission Assist AI
        </span>
      </motion.div>
    </Link>
  )
}
