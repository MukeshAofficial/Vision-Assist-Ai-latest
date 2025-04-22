"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#121629]">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 bg-[#1a1f38]/80 backdrop-blur-sm border border-purple-900/50 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Application Error</h2>
            <p className="text-gray-300 mb-6">A critical error has occurred. We apologize for the inconvenience.</p>
            <div className="flex justify-center">
              <Button onClick={reset} className="bg-purple-700 hover:bg-purple-600 text-white">
                Try again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
