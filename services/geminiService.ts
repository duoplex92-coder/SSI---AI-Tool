import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { FinalizedPostData } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Social Media Content Strategist. Your goal is to help the user refine raw ideas into high-quality social media posts.

**Behavior Protocol:**
1. **Consultation Phase:** When the user provides a raw idea, discuss it briefly. Suggest improvements for engagement, tone, or viral potential. Ask 1-2 clarifying questions if the idea is vague.
2. **Finalization Phase:** When the user explicitly agrees to a direction or says "Finalize" or "Create this," you MUST output the final result in a specific JSON format only.

**JSON Output Format:**
When finalizing, strictly adhere to this JSON structure inside a code block:

\`\`\`json
{
  "status": "finalized",
  "content_caption": "The engaging caption for the social media post, including emojis.",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "image_prompt": "A highly detailed, photorealistic prompt suitable for Imagen 3. Describe lighting, camera angle, subject, and style.",
  "video_prompt": "A cinematic prompt suitable for Veo, describing motion, camera movement, and subject action."
}
\`\`\`
`;

let chatSession: Chat | null = null;

// Initialize or get the Gemini client. We create a new one each time to ensure key is fresh.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const initializeChat = async () => {
  const ai = getAiClient();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<{ text: string, finalizedData?: FinalizedPostData }> => {
  if (!chatSession) {
    await initializeChat();
  }
  
  if (!chatSession) throw new Error("Chat session failed to initialize");

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({ message });
    const text = result.text || "";

    // Check for JSON block
    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    let finalizedData: FinalizedPostData | undefined;

    if (jsonMatch && jsonMatch[1]) {
      try {
        finalizedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from model response", e);
      }
    }

    return { text, finalizedData };
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data received");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

export const generateVideo = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Mobile first for social media
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");

    // Fetch the actual video bytes using the key
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download video file");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};