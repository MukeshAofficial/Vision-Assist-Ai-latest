import { NextResponse } from "next/server"
import { analyzeImage } from "@/lib/gemini-service"

// Add export const runtime = 'edge' to ensure this runs in a Node.js environment
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not defined")
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    // Parse the request body
    const body = await request.json()

    // Extract only the data we need
    const imageData = body.image
    const promptText = body.prompt

    if (!imageData) {
      return NextResponse.json({ error: "Invalid request. Image data is required." }, { status: 400 })
    }

    // Analyze the image using Gemini
    const analysis = await analyzeImage(imageData, promptText)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error in image analysis API:", error)

    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to analyze image",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
