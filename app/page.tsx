"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mic, Eye, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAccessibility } from "@/components/accessibility-provider"
import GlowEffect from "@/components/glow-effect"
import FeatureCard from "@/components/feature-card"
import Logo from "@/components/logo"

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)
  const { fontSize, highContrast, voiceFeedback } = useAccessibility()
  const { startListening, stopListening, transcript, resetTranscript } = useSpeechRecognition()
  const { speak } = useSpeechSynthesis()

  useEffect(() => {
    // Welcome message when page loads
    if (voiceFeedback) {
      const timer = setTimeout(() => {
        speak("Welcome to Vision Assist AI. Empowering navigation through voice and vision.")
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [speak, voiceFeedback])

  useEffect(() => {
    if (!transcript) return

    const command = transcript.toLowerCase()

    if (command.includes("smart navigation") || command.includes("navigation")) {
      speak("Opening smart navigation")
      router.push("/navigation")
    } else if (command.includes("video analyzer") || command.includes("scan") || command.includes("video")) {
      speak("Opening video analyzer")
      router.push("/scan")
    } else if (command.includes("voice assistant") || command.includes("gpt") || command.includes("assistant")) {
      speak("Opening voice assistant")
      router.push("/gpt")
    } else if (command.includes("get started")) {
      speak("Getting started with Vision Assist")
      router.push("/gpt")
    }

    resetTranscript()
  }, [transcript, router, speak, resetTranscript])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
      toast({
        title: "Voice recognition stopped",
        description: "Click the microphone again to start listening",
      })
    } else {
      startListening()
      setIsListening(true)
      speak('Listening. Say "Smart Navigation", "Video Analyzer", or "Voice Assistant"')
      toast({
        title: "Listening...",
        description: 'Say "Smart Navigation", "Video Analyzer", or "Voice Assistant"',
      })

      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleListening}
            className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30"
          >
            <Mic className={`mr-2 h-4 w-4 ${isListening ? "text-purple-400 animate-pulse" : ""}`} />
            {isListening ? "Listening..." : "Voice Command"}
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center relative">
        <GlowEffect />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Empowering Navigation Through Voice and Vision
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Navigate seamlessly using voice commands and advanced visual analysis.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => router.push("/gpt")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-md text-lg"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/about")}
              className="border-purple-500 text-purple-300 hover:bg-purple-900/30 px-8 py-6 rounded-md text-lg"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <FeatureCard
            icon={<Mic size={32} />}
            title="Smart Navigation"
            description="Navigate seamlessly through voice commands. Say 'Go to Scan' or 'Go to GPT' for intuitive interaction."
            onClick={() => router.push("/navigation")}
          />

          <FeatureCard
            icon={<Eye size={32} />}
            title="Video Analyzer"
            description="Analyze video in real-time and receive actionable navigation insights for enhanced situational awareness."
            onClick={() => router.push("/scan")}
          />

          <FeatureCard
            icon={<MessageSquare size={32} />}
            title="Voice Assistant (GPT)"
            description="Engage in interactive conversations using a voice-to-voice AI powered by GPT for instant responses."
            onClick={() => router.push("/gpt")}
          />
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        <p>Powered by Gemini AI • Designed for accessibility</p>
      </footer>
    </div>
  )
}
