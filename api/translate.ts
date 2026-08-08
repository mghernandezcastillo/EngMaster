import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { word, context, language } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Missing word" });
    }
    
    const prompt = `
    Translate the English word "${word}" into ${language === 'es' ? 'Spanish' : 'English'}.
    Context sentence: "${context || ''}"
    
    Provide a highly concise response formatted in JSON with the keys:
    - translation (string, just the translated word or very short phrase)
    - phonetics (string, IPA pronunciation of the original English word "${word}", not of the translation)
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    res.status(200).json(result);
  } catch (error) {
    console.error("AI translation error:", error);
    res.status(500).json({ error: "Failed to generate translation" });
  }
}
