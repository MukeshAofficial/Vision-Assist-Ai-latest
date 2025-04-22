"use client"

import { useState, useCallback, useEffect } from "react"

interface SpeechSynthesisHook {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isPaused: boolean
  pause: () => void
  resume: () => void
  stopSpeaking: () => void
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Initialize speech synthesis
      window.speechSynthesis.cancel()

      // Set up event listeners for global speech synthesis
      const handleSpeechEnd = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      window.speechSynthesis.addEventListener("end", handleSpeechEnd)

      return () => {
        window.speechSynthesis.removeEventListener("end", handleSpeechEnd)
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create a new utterance
      const newUtterance = new SpeechSynthesisUtterance(text)

      // Get available voices
      const voices = window.speechSynthesis.getVoices()

      // Try to find a good English voice
      const englishVoice =
        voices.find((voice) => voice.lang.includes("en") && voice.name.includes("Female")) ||
        voices.find((voice) => voice.lang.includes("en"))

      if (englishVoice) {
        newUtterance.voice = englishVoice
      }

      // Set properties
      newUtterance.rate = 1.0
      newUtterance.pitch = 1.0
      newUtterance.volume = 1.0

      // Set up event handlers
      newUtterance.onstart = () => setIsSpeaking(true)
      newUtterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }
      newUtterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      // Store the utterance
      setUtterance(newUtterance)

      // Speak
      window.speechSynthesis.speak(newUtterance)
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSpeaking])

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [isPaused])

  // Alias for stop for better API naming
  const stopSpeaking = stop

  return {
    speak,
    stop,
    isSpeaking,
    isPaused,
    pause,
    resume,
    stopSpeaking,
  }
}
