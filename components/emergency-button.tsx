"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

interface EmergencyButtonProps {
  fontSize: string
  highContrast: boolean
}

export default function EmergencyButton({ fontSize, highContrast }: EmergencyButtonProps) {
  const { toast } = useToast()
  const { speak } = useSpeechSynthesis()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEmergencyClick = () => {
    if (!showConfirm) {
      setShowConfirm(true)
      speak("Emergency contact button pressed. Press again to confirm or X to cancel.")

      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100])
      }
    } else {
      // Trigger emergency contact
      speak("Emergency contact activated. Contacting your emergency contact now.")
      toast({
        title: "Emergency Contact Activated",
        description: "Contacting your emergency contact...",
        variant: "destructive",
      })

      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200])
      }

      setShowConfirm(false)
    }
  }

  return (
    <div className="mt-4">
      {showConfirm ? (
        <div className="flex items-center gap-2">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleEmergencyClick}
              variant="destructive"
              size="lg"
              className="font-bold"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
              aria-label="Confirm emergency contact"
            >
              <Phone className="mr-2 h-5 w-5" />
              Confirm Emergency
            </Button>
          </motion.div>

          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                setShowConfirm(false)
                speak("Emergency contact cancelled.")
              }}
              variant="outline"
              size="icon"
              aria-label="Cancel emergency contact"
              className="border-gray-500 text-gray-300"
            >
              <X size={24} />
            </Button>
          </motion.div>
        </div>
      ) : (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleEmergencyClick}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-900/30 hover:text-red-300"
            style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            aria-label="Emergency contact"
          >
            <Phone className="mr-2 h-5 w-5" />
            Emergency Contact
          </Button>
        </motion.div>
      )}
    </div>
  )
}
