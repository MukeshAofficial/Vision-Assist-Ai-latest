import { NextResponse } from "next/server"
import { chatWithGemini } from "@/lib/gemini-service"

// Add export const runtime = 'edge' to ensure this runs in a Node.js environment
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not defined")
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request. Messages array is required." }, { status: 400 })
    }

    // Format system prompt for visually impaired assistance
    const systemPrompt =
      "You are Vission Assist AI, a helpful assistant designed specifically for visually impaired users. Provide clear, concise, and descriptive responses. Focus on being helpful and providing information that would be most useful for someone who cannot see. If describing directions or locations, be very specific."

    // Get response from Gemini, passing the system prompt separately
    const response = await chatWithGemini(messages, systemPrompt)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
