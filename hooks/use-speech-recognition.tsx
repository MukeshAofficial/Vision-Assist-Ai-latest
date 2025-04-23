"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  startListening: (duration?: number) => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event: any) => {
          let fullTranscript = ""
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript
          }
          setTranscript(fullTranscript)
        }

        recognitionInstance.onerror = (event: any) => {
          setError(event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      } else {
        setError("Speech recognition not supported in this browser")
      }
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startListening = useCallback(
    (duration = 5000) => {
      if (recognition) {
        try {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }

          // Reset transcript before starting
          setTranscript("")

          recognition.start()
          setIsListening(true)
          setError(null)

          // Set timeout to stop listening after duration
          timeoutRef.current = setTimeout(() => {
            if (recognition) {
              recognition.stop()
              setIsListening(false)
            }
          }, duration)
        } catch (err) {
          console.error("Error starting speech recognition:", err)
          setError("Error starting speech recognition")
        }
      } else {
        setError("Speech recognition not initialized")
      }
    },
    [recognition],
  )

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [recognition])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}
