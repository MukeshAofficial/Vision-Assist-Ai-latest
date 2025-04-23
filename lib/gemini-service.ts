// Mark this file as server-only to prevent it from being bundled with client code
import "server-only"

// Use dynamic import to ensure the package is only loaded on the server
// This prevents the browser from trying to load the GoogleGenAI package
export async function generateTextResponse(prompt: string) {
  try {
    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set")
    }

    // Dynamically import the GoogleGenAI package
    const { GoogleGenerativeAI } = await import("@google/generative-ai")

    // Initialize the client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating text response:", error)
    return "I'm sorry, I couldn't process your request at the moment. Please try again later."
  }
}

// Vision analysis with Gemini
export async function analyzeImage(imageBase64: string, prompt?: string) {
  try {
    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set")
    }

    // Dynamically import the GoogleGenAI package
    const { GoogleGenerativeAI } = await import("@google/generative-ai")

    // Initialize the client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    // Use gemini-1.5-flash instead of pro to avoid rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create parts array with image
    const parts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]

    // Add text prompt if provided
    if (prompt) {
      parts.push({ text: String(prompt) })
    } else {
      parts.push({
        text: "Describe this image in detail, focusing on any potential obstacles, surroundings, and important elements that would be helpful for a visually impaired person to know about.",
      })
    }

    // Generate content with the image
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    })

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error analyzing image:", error)
    return "I'm sorry, I couldn't analyze this image at the moment. The scene appears to have some objects and surroundings, but please try again for a more detailed description."
  }
}

// Chat conversation with Gemini
export async function chatWithGemini(messages: { role: string; content: string }[], systemPrompt?: string) {
  try {
    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set")
    }

    // Dynamically import the GoogleGenAI package
    const { GoogleGenerativeAI } = await import("@google/generative-ai")

    // Initialize the client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Convert messages to Gemini format - filter out system messages
    const formattedMessages = messages
      .filter((msg) => msg.role !== "system") // Remove system messages
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

    // Make sure we have at least one user message
    if (formattedMessages.length === 0 || formattedMessages[0].role !== "user") {
      // If no user message, create a default one
      formattedMessages.unshift({
        role: "user",
        parts: [{ text: "Hello" }],
      })
    }

    // If we have a system prompt, prepend it to the first user message
    if (systemPrompt && formattedMessages.length > 0 && formattedMessages[0].role === "user") {
      const firstUserMessage = formattedMessages[0].parts[0].text
      formattedMessages[0].parts[0].text = `${systemPrompt}\n\nUser: ${firstUserMessage}`
    }

    // Start chat with history (excluding the last message)
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1),
    })

    // Get the last message content (which should be from the user)
    const lastMessage = formattedMessages[formattedMessages.length - 1]
    const lastMessageContent = lastMessage.role === "user" ? lastMessage.parts[0].text : "Hello"

    // Send the last message
    const result = await chat.sendMessage(lastMessageContent)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error in chat conversation:", error)
    return "I'm sorry, I couldn't process your request at the moment. Please try again later."
  }
}
