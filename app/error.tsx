"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121629] p-4">
      <div className="w-full max-w-md p-6 bg-[#1a1f38]/80 backdrop-blur-sm border border-purple-900/50 rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">We encountered an error while processing your request. Please try again.</p>
        <div className="flex justify-center">
          <Button onClick={reset} className="bg-purple-700 hover:bg-purple-600 text-white">
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
