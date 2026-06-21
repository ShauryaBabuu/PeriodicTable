import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse request bodies
app.use(express.json());

// Initialize server-side Gemini client safely
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Chatbot queries will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. AI Assistant Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { element, question } = req.body;
    if (!element || !question) {
      return res.status(400).json({ error: "Missing required fields 'element' or 'question'." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        response: "⚠️ API Key not configured yet. Please set your GEMINI_API_KEY in Settings > Secrets. / कृपया सेटिंग्स > सीक्रेट्स में अपनी GEMINI_API_KEY सहेजें।"
      });
    }

    const ai = getAiClient();
    
    const prompt = `Element: ${element}\nUser Question: ${question}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert bilingual (Hindi & English) Chemistry mentor. Answer the user's question about the specified element precisely and clearly. Present explanations in both pure English and conversational Hindi/Devanagari, using visual formatting. Keep your response highly concise (max 120 words) for effortless reading inside a small sidebar chat widget.",
        temperature: 0.7,
      },
    });

    const reply = geminiResponse.text || "No response received. / कोई प्रतिक्रिया नहीं मिली।";
    res.json({ response: reply });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error / आंतरिक सर्वर त्रुटि", 
      details: error?.message || String(error)
    });
  }
});

// Serve assets with Vite Middleware in Development, or Static files in Production
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring production mode with static hosting...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 Full-stack periodic server ready on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
  process.exit(1);
});
