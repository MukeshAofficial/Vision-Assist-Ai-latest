"use client"

interface ChatBubbleProps {
  message: {
    role: "user" | "assistant"
    content: string
  }
  fontSize: string
  highContrast: boolean
}

export default function ChatBubble({ message, fontSize, highContrast }: ChatBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? "bg-purple-700/80 text-white" : "bg-[#2a2f48] text-gray-100"
        }`}
      >
        <p className="text-lg" style={{ fontSize: `${Number.parseInt(fontSize)}px` }}>
          {message.content}
        </p>
      </div>
    </div>
  )
}
