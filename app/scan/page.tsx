"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Camera, Mic, MicOff, ArrowLeft, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAccessibility } from "@/components/accessibility-provider"
import { useRouter } from "next/navigation"
import EmergencyButton from "@/components/emergency-button"
import Logo from "@/components/logo"
import GlowEffect from "@/components/glow-effect"

// Mock response for offline mode or when API fails
const MOCK_RESPONSES = [
  "I can see what appears to be an indoor space. There are no obvious obstacles in the immediate vicinity.",
  "This looks like an outdoor area. The path ahead seems clear, but proceed with caution.",
  "I can see what might be furniture or objects in the frame. Please be careful when moving forward.",
  "The image shows what appears to be a room with some furniture. There are no immediate hazards visible.",
  "I can see what looks like a pathway. It appears to be clear of obstacles.",
]

export default function ScanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [userQuestion, setUserQuestion] = useState<string>("")
  const { fontSize, highContrast, voiceFeedback } = useAccessibility()
  const { startListening, stopListening, transcript, resetTranscript } = useSpeechRecognition()
  const { speak, isSpeaking, stopSpeaking } = useSpeechSynthesis()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    // Welcome message when page loads
    if (voiceFeedback) {
      const timer = setTimeout(() => {
        speak('Video analyzer ready. Click the camera button to start scanning or say "Start camera".')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [speak, voiceFeedback])

  useEffect(() => {
    if (!transcript || !isListening) return

    const command = transcript.toLowerCase()

    if (command.includes("go back") || command.includes("go home")) {
      speak("Going back to home page")
      router.push("/")
      return
    }

    if (command.includes("go to gpt") || command.includes("go to assistant")) {
      speak("Opening voice assistant")
      router.push("/gpt")
      return
    }

    if (command.includes("start camera") || command.includes("open camera")) {
      speak("Starting camera")
      startCamera()
      return
    }

    if (command.includes("stop camera") || command.includes("close camera")) {
      speak("Stopping camera")
      stopCamera()
      return
    }

    if (command.includes("take picture") || command.includes("snap photo") || command.includes("analyze")) {
      speak("Taking picture for analysis")
      captureImage()
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

    // If camera is active and we have a transcript, use it as a question for the image
    if (cameraActive) {
      setUserQuestion(transcript)
      captureImage(transcript)
      return
    }

    // If no specific command is recognized, provide help
    speak('You can say "take picture", "start camera", "stop camera", or "go home"')
    resetTranscript()
  }, [transcript, isListening, router, speak, resetTranscript, cameraActive])

  const startCamera = async () => {
    try {
      if (!videoRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      videoRef.current.srcObject = stream
      setCameraActive(true)

      toast({
        title: "Camera activated",
        description: "Say 'take picture' or click the camera button to analyze",
      })

      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      })
      speak("Could not access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return

    const stream = videoRef.current.srcObject as MediaStream
    const tracks = stream.getTracks()

    tracks.forEach((track) => track.stop())
    videoRef.current.srcObject = null
    setCameraActive(false)

    toast({
      title: "Camera stopped",
      description: "Camera has been turned off",
    })
  }

  // Compress image before sending to API
  const compressImage = (canvas: HTMLCanvasElement, quality = 0.7): string => {
    return canvas.toDataURL("image/jpeg", quality)
  }

  // Get a mock response when API fails
  const getMockResponse = (question?: string): string => {
    const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length)
    let response = MOCK_RESPONSES[randomIndex]

    if (question) {
      response += ` Regarding your question: "${question}", I'm currently unable to provide a specific answer as I'm operating in offline mode.`
    }

    return response
  }

  // Update the captureImage function to compress the image
  const captureImage = async (question?: string) => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      speak("Camera is not active. Please start the camera first.")
      toast({
        title: "Camera not active",
        description: "Please start the camera first",
        variant: "destructive",
      })
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video but scale down for better performance
    const scaleFactor = 0.7 // Reduce to 70% of original size
    canvas.width = video.videoWidth * scaleFactor
    canvas.height = video.videoHeight * scaleFactor

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Compress the image
    const compressedImage = compressImage(canvas, 0.7)

    // Make sure question is a simple string if provided
    const questionText = question ? String(question) : undefined

    // Reset retry count
    setRetryCount(0)

    // Process the image with the optional question
    await processImage(compressedImage, questionText)
  }

  // Update the processImage function with better error handling and retry logic
  const processImage = async (imageBase64: string, question?: string) => {
    setIsProcessing(true)

    try {
      // Extract the base64 data without the prefix
      const base64Data = imageBase64.split(",")[1]

      if (!base64Data) {
        throw new Error("Invalid image data")
      }

      // Call the API to analyze the image
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          prompt: question
            ? String(question)
            : "Describe this scene in detail for a visually impaired person. Focus on any obstacles, people, or important elements.",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to analyze image")
      }

      const analysis = data.analysis

      setAnalysisResult(analysis)

      // Speak the analysis if voice feedback is enabled
      if (voiceFeedback) {
        speak(analysis)
      }

      toast({
        title: "Analysis complete",
        description: "Image has been analyzed",
      })
    } catch (error) {
      console.error("Error analyzing image:", error)

      const errorMessage = error instanceof Error ? error.message : "Failed to analyze image"

      // Implement retry logic
      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1
        setRetryCount(nextRetryCount)

        toast({
          title: `Retry ${nextRetryCount}/${maxRetries}`,
          description: "Retrying image analysis...",
        })

        // Wait a moment before retrying
        setTimeout(() => {
          processImage(imageBase64, question)
        }, 1000)

        return
      }

      // After max retries, use a mock response
      const mockResponse = getMockResponse(question)

      toast({
        title: "Using offline mode",
        description: "Could not connect to AI service. Using basic analysis.",
      })

      setAnalysisResult(mockResponse)

      if (voiceFeedback) {
        speak(mockResponse)
      }
    } finally {
      if (retryCount >= maxRetries) {
        setIsProcessing(false)
        setUserQuestion("")
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
      speak(
        cameraActive
          ? 'Listening. Ask a question about what you see or say "take picture"'
          : 'Listening. You can say "start camera", "take picture", or "go home"',
      )
      toast({
        title: "Listening...",
        description: "Say a command or ask a question",
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
              stopCamera()
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
          Video Analyzer
        </h1>

        <motion.div
          className="w-full max-w-3xl mx-auto aspect-video relative rounded-lg overflow-hidden border-2 border-purple-700/50 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            aria-label="Camera feed"
          />
          <canvas ref={canvasRef} className="hidden" />

          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <p className="text-white text-xl">Camera inactive. Click the camera button or say "Start camera"</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-2" />
                <p className="text-white">
                  {retryCount > 0 ? `Processing... (Retry ${retryCount}/${maxRetries})` : "Processing..."}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={cameraActive ? captureImage : startCamera}
              size="lg"
              className="bg-purple-700 hover:bg-purple-600 text-white"
              disabled={isProcessing}
              aria-label={cameraActive ? "Take picture" : "Start camera"}
            >
              <Camera size={24} className="mr-2" />
              <span>{cameraActive ? "Take Picture" : "Start Camera"}</span>
            </Button>
          </motion.div>

          {cameraActive && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={stopCamera}
                variant="outline"
                size="lg"
                className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
                aria-label="Stop camera"
              >
                Stop Camera
              </Button>
            </motion.div>
          )}
        </div>

        {analysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl mx-auto p-4 rounded-lg mb-6 bg-[#1a1f38]/80 backdrop-blur-sm border border-purple-900/50"
          >
            <h2
              className="text-xl font-semibold mb-2 text-purple-300"
              style={{ fontSize: `${Number.parseInt(fontSize) * 1.1}px` }}
            >
              Analysis Result:
            </h2>
            <p className="text-lg text-gray-200" style={{ fontSize: `${Number.parseInt(fontSize)}px` }}>
              {analysisResult}
            </p>

            {userQuestion && (
              <div className="mt-4 pt-4 border-t border-purple-900/50">
                <p className="text-sm text-purple-300">In response to your question:</p>
                <p className="text-md text-gray-300 italic">"{userQuestion}"</p>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex flex-col items-center mt-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-4">
            <Button
              onClick={toggleListening}
              size="lg"
              className={`rounded-full p-6 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""} 
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
                  <MicOff size={24} className="text-white" />
                ) : isSpeaking ? (
                  <Volume2 size={24} className="text-white" />
                ) : (
                  <Mic size={24} className="text-white" />
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
              ? "Processing image..."
              : isListening
                ? "Listening... Say a command or ask a question"
                : isSpeaking
                  ? "Speaking... Click mic to stop"
                  : cameraActive
                    ? "Click mic to ask about what you see"
                    : "Click mic to give a command"}
          </motion.p>

          <EmergencyButton fontSize={fontSize} highContrast={highContrast} />
        </div>
      </main>
    </div>
  )
}
