"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AccessibilityContextType {
  fontSize: string
  setFontSize: (size: string) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
  voiceFeedback: boolean
  setVoiceFeedback: (enabled: boolean) => void
  hapticFeedback: boolean
  setHapticFeedback: (enabled: boolean) => void
  gestureControl: boolean
  setGestureControl: (enabled: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState("16")
  const [highContrast, setHighContrast] = useState(false)
  const [voiceFeedback, setVoiceFeedback] = useState(true)
  const [hapticFeedback, setHapticFeedback] = useState(true)
  const [gestureControl, setGestureControl] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedFontSize = localStorage.getItem("vission-font-size")
    const storedHighContrast = localStorage.getItem("vission-high-contrast")
    const storedVoiceFeedback = localStorage.getItem("vission-voice-feedback")
    const storedHapticFeedback = localStorage.getItem("vission-haptic-feedback")
    const storedGestureControl = localStorage.getItem("vission-gesture-control")

    if (storedFontSize) setFontSize(storedFontSize)
    if (storedHighContrast) setHighContrast(storedHighContrast === "true")
    if (storedVoiceFeedback) setVoiceFeedback(storedVoiceFeedback === "true")
    if (storedHapticFeedback) setHapticFeedback(storedHapticFeedback === "true")
    if (storedGestureControl) setGestureControl(storedGestureControl === "true")
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("vission-font-size", fontSize)
    localStorage.setItem("vission-high-contrast", highContrast.toString())
    localStorage.setItem("vission-voice-feedback", voiceFeedback.toString())
    localStorage.setItem("vission-haptic-feedback", hapticFeedback.toString())
    localStorage.setItem("vission-gesture-control", gestureControl.toString())

    // Apply high contrast mode to the document
    if (highContrast) {
      document.documentElement.classList.add("high-contrast-mode")
    } else {
      document.documentElement.classList.remove("high-contrast-mode")
    }
  }, [fontSize, highContrast, voiceFeedback, hapticFeedback, gestureControl])

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        voiceFeedback,
        setVoiceFeedback,
        hapticFeedback,
        setHapticFeedback,
        gestureControl,
        setGestureControl,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
