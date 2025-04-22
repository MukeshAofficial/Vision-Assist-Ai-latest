"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useAccessibility } from "./accessibility-provider"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

interface AccessibilityPanelProps {
  onClose: () => void
}

export default function AccessibilityPanel({ onClose }: AccessibilityPanelProps) {
  const {
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
  } = useAccessibility()

  const { speak } = useSpeechSynthesis()

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0].toString()
    setFontSize(newSize)
    if (voiceFeedback) {
      speak(`Font size set to ${newSize} pixels`)
    }
  }

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked)
    if (voiceFeedback) {
      speak(`High contrast mode ${checked ? "enabled" : "disabled"}`)
    }
  }

  const handleVoiceFeedbackChange = (checked: boolean) => {
    setVoiceFeedback(checked)
    if (checked) {
      speak("Voice feedback enabled")
    }
  }

  const handleHapticFeedbackChange = (checked: boolean) => {
    setHapticFeedback(checked)
    if (voiceFeedback) {
      speak(`Haptic feedback ${checked ? "enabled" : "disabled"}`)
    }

    // Provide haptic feedback when enabling
    if (checked && navigator.vibrate) {
      navigator.vibrate(200)
    }
  }

  const handleGestureControlChange = (checked: boolean) => {
    setGestureControl(checked)
    if (voiceFeedback) {
      speak(`Gesture control ${checked ? "enabled" : "disabled"}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        highContrast ? "bg-black/90" : "bg-black/70"
      }`}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`w-full max-w-md rounded-lg p-6 ${
          highContrast ? "bg-black text-white border-2 border-white" : "bg-background"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ fontSize: `${Number.parseInt(fontSize) * 1.2}px` }}>
            Accessibility Settings
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close accessibility panel"
            className={highContrast ? "text-white hover:bg-gray-800" : ""}
          >
            <X size={24} />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="font-size"
                className="text-lg font-medium"
                style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
              >
                Font Size: {fontSize}px
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFontSize("16")
                  if (voiceFeedback) speak("Font size reset to default")
                }}
                className={highContrast ? "border-white text-white" : ""}
              >
                Reset
              </Button>
            </div>
            <Slider
              id="font-size"
              min={12}
              max={32}
              step={1}
              value={[Number.parseInt(fontSize)]}
              onValueChange={handleFontSizeChange}
              className={highContrast ? "bg-white" : ""}
            />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="high-contrast"
              className="text-lg font-medium"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              High Contrast Mode
            </label>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={handleHighContrastChange}
              className={highContrast ? "bg-white" : ""}
            />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="voice-feedback"
              className="text-lg font-medium"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              Voice Feedback
            </label>
            <Switch
              id="voice-feedback"
              checked={voiceFeedback}
              onCheckedChange={handleVoiceFeedbackChange}
              className={highContrast ? "bg-white" : ""}
            />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="haptic-feedback"
              className="text-lg font-medium"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              Haptic Feedback
            </label>
            <Switch
              id="haptic-feedback"
              checked={hapticFeedback}
              onCheckedChange={handleHapticFeedbackChange}
              className={highContrast ? "bg-white" : ""}
            />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="gesture-control"
              className="text-lg font-medium"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              Gesture Control
            </label>
            <Switch
              id="gesture-control"
              checked={gestureControl}
              onCheckedChange={handleGestureControlChange}
              className={highContrast ? "bg-white" : ""}
            />
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={onClose} className="w-full" style={{ fontSize: `${Number.parseInt(fontSize)}px` }}>
            Save Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
