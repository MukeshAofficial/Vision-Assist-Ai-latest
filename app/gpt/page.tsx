"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, ArrowLeft, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAccessibility } from "@/components/accessibility-provider"
import { useRouter } from "next/navigation"
import ChatBubble from "@/components/chat-bubble"
import EmergencyButton from "@/components/emergency-button"
import Logo from "@/components/logo"
import GlowEffect from "@/components/glow-effect"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function GPTPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ])
  const { fontSize, highContrast, voiceFeedback } = useAccessibility()
  const { startListening, stopListening, transcript, resetTranscript } = useSpeechRecognition()
  const { speak, isSpeaking, stopSpeaking } = useSpeechSynthesis()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    // Welcome message when page loads
    if (voiceFeedback) {
      const timer = setTimeout(() => {
        speak('Voice assistant ready. Click the microphone or say "Hey Vision" to ask a question.')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [speak, voiceFeedback])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!transcript || !isListening) return

    const command = transcript.toLowerCase()

    if (command.includes("go back") || command.includes("go home")) {
      speak("Going back to home page")
      router.push("/")
      return
    }

    if (command.includes("go to scan") || command.includes("video analyzer")) {
      speak("Opening video analyzer")
      router.push("/scan")
      return
    }

    if (command.includes("emergency")) {
      speak("Activating emergency contact")
      toast({
        title: "Emergency Contact",
        description: "Contacting your emergency contact...",
        variant: "destructive",
      })
      return
    }

    // Process the user's message
    handleUserMessage(transcript)
    resetTranscript()
  }, [transcript, isListening, router, speak, resetTranscript])

  const handleUserMessage = async (message: string) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: message }])

    // Stop listening while processing
    stopListening()
    setIsListening(false)
    setIsProcessing(true)
    setRetryCount(0)

    try {
      // Call Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: message }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from API")
      }

      const data = await response.json()
      const aiResponse = data.response

      // Add AI response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }])

      // Speak the response if voice feedback is enabled
      if (voiceFeedback) {
        speak(aiResponse)
      }

      toast({
        title: "Response received",
        description: "The AI has responded to your question",
      })
    } catch (error) {
      console.error("Error:", error)

      // Implement retry logic
      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1
        setRetryCount(nextRetryCount)

        toast({
          title: `Retry ${nextRetryCount}/${maxRetries}`,
          description: "Retrying to get a response...",
        })

        // Wait a moment before retrying
        setTimeout(() => {
          handleUserMessage(message)
        }, 1000)

        return
      }

      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
        },
      ])
    } finally {
      if (retryCount >= maxRetries) {
        setIsProcessing(false)
        setRetryCount(0)
      }
    }
  }

  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }

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
      speak("Listening. What would you like to know?")
      toast({
        title: "Listening...",
        description: "Speak your question now",
      })

      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121629]">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              speak("Going back to home page")
              router.push("/")
            }}
            aria-label="Go back to home"
            className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30 mr-4"
          >
            <ArrowLeft size={24} />
          </Button>
          <Logo />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col relative">
        <GlowEffect />

        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Talk to Vission Assistant
        </h1>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-6 p-4 rounded-lg border border-purple-900/50 bg-[#1a1f38]/80 backdrop-blur-sm"
          style={{ maxHeight: "60vh" }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBubble message={message} fontSize={fontSize} highContrast={highContrast} />
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center my-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-4">
            <Button
              onClick={toggleListening}
              size="lg"
              className={`rounded-full p-8 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""} 
                ${isListening ? "bg-purple-600" : "bg-purple-700"} 
                hover:bg-purple-600 text-white`}
              disabled={isProcessing}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={isListening ? { repeat: Number.POSITIVE_INFINITY, duration: 1.5 } : {}}
              >
                {isListening ? (
                  <MicOff size={32} className="text-white" />
                ) : isSpeaking ? (
                  <Volume2 size={32} className="text-white" />
                ) : (
                  <Mic size={32} className="text-white" />
                )}
              </motion.div>
            </Button>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl mb-4 text-gray-300"
            style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            animate={isListening ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={isListening ? { repeat: Number.POSITIVE_INFINITY, duration: 2 } : {}}
          >
            {isProcessing
              ? retryCount > 0
                ? `Processing... (Retry ${retryCount}/${maxRetries})`
                : "Processing your request..."
              : isListening
                ? "Listening... Speak your question"
                : isSpeaking
                  ? "Speaking... Click mic to stop"
                  : "Click mic to ask a question"}
          </motion.p>

          <EmergencyButton fontSize={fontSize} highContrast={highContrast} />
        </div>
      </main>
    </div>
  )
}
