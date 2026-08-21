import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { word, context, language = 'es' } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Missing word" });
    }
    
    const prompt = `
    You are an expert bilingual English-Spanish dictionary and contextual translator.
    The student clicked on the English word: "${word}".
    The full sentence/context is: "${context || ''}"
    
    Task:
    1. Translate the English word "${word}" into Spanish.
       CRITICAL RULES:
       - The translation MUST ALWAYS be in Spanish (español). NEVER return an English word, English synonym, or English definition.
       - The meaning must be strictly CONTEXTUAL based on the provided sentence (e.g. if the word has multiple meanings, pick the exact one that matches the sentence).
       - Keep it concise: a direct Spanish translation word or short natural phrase (1-3 words).
    2. Provide the phonetic IPA pronunciation of the original English word "${word}".
    
    Provide JSON only with keys:
    - translation (string, in Spanish)
    - phonetics (string, IPA pronunciation of the English word)
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
