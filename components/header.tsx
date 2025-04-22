"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAccessibility } from "./accessibility-provider"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import AccessibilityPanel from "./accessibility-panel"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { fontSize, highContrast } = useAccessibility()
  const { speak } = useSpeechSynthesis()
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isHomePage = pathname === "/"

  if (isHomePage) return null

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b ${
        highContrast ? "bg-black border-white" : "bg-background/95 backdrop-blur"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                speak("Going to home page")
                router.push("/")
              }}
              aria-label="Go to home page"
              className={highContrast ? "text-white hover:bg-gray-800" : ""}
            >
              <Home size={24} />
            </Button>
          </motion.div>

          <h1
            className={`text-xl font-bold ${highContrast ? "text-white" : ""}`}
            style={{ fontSize: `${Number.parseInt(fontSize) * 1.1}px` }}
          >
            Vission Assist AI
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button
            variant={pathname === "/gpt" ? "default" : "outline"}
            onClick={() => {
              speak("Going to voice assistant")
              router.push("/gpt")
            }}
            className={highContrast && pathname !== "/gpt" ? "border-white text-white" : ""}
            style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
          >
            Voice Assistant
          </Button>

          <Button
            variant={pathname === "/scan" ? "default" : "outline"}
            onClick={() => {
              speak("Going to video scanner")
              router.push("/scan")
            }}
            className={highContrast && pathname !== "/scan" ? "border-white text-white" : ""}
            style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
          >
            Video Scanner
          </Button>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                speak("Opening accessibility settings")
                setShowSettings(true)
              }}
              aria-label="Accessibility settings"
              className={highContrast ? "text-white hover:bg-gray-800" : ""}
            >
              <Settings size={24} />
            </Button>
          </motion.div>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            className={highContrast ? "text-white hover:bg-gray-800" : ""}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`md:hidden border-t ${highContrast ? "bg-black border-white" : "bg-background"}`}
        >
          <div className="container py-4 flex flex-col gap-2">
            <Button
              variant={pathname === "/gpt" ? "default" : "outline"}
              onClick={() => {
                speak("Going to voice assistant")
                router.push("/gpt")
                setShowMobileMenu(false)
              }}
              className="w-full justify-start"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              Voice Assistant
            </Button>

            <Button
              variant={pathname === "/scan" ? "default" : "outline"}
              onClick={() => {
                speak("Going to video scanner")
                router.push("/scan")
                setShowMobileMenu(false)
              }}
              className="w-full justify-start"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              Video Scanner
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                speak("Opening accessibility settings")
                setShowSettings(true)
                setShowMobileMenu(false)
              }}
              className="w-full justify-start"
              style={{ fontSize: `${Number.parseInt(fontSize)}px` }}
            >
              <Settings size={20} className="mr-2" />
              Accessibility Settings
            </Button>
          </div>
        </motion.div>
      )}

      {showSettings && <AccessibilityPanel onClose={() => setShowSettings(false)} />}
    </header>
  )
}
