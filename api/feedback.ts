import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text, userAttempt, language } = req.body;
    if (!text || !userAttempt) {
      return res.status(400).json({ error: "Missing text or userAttempt" });
    }

    const prompt = `
    You are an expert English teacher helping a student memorize a text to reach C1 level.
    The original text is: "${text}"
    The student's attempt from memory is: "${userAttempt}"
    
    Provide constructive feedback in ${language === 'es' ? 'Spanish' : 'English'}.
    1. Point out any missed advanced vocabulary, phrasal verbs, or idioms.
    2. Rate their accuracy out of 100%.
    3. Give a short, motivating tip.
    Keep the response concise and formatted in JSON with keys: feedback (string), score (number), missedWords (array of strings).
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
    console.error("AI feedback error:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
}
