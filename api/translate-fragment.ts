import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text, vocabulary } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const vocabList = Array.isArray(vocabulary)
      ? vocabulary.map((item) => `- ${item.expression}: ${item.meaning}`).join('\n')
      : '';

    const prompt = `
    Translate this English learning fragment into natural Spanish while preserving the meaning and sentence order.

    English fragment:
    "${text}"

    Learned vocabulary from the current DATA_NODE lesson:
    ${vocabList}

    Return JSON only with:
    - translatedText: string, the full Spanish translation.
    - vocabularyHighlights: array of objects with:
      - expression: original English expression.
      - translation: the exact Spanish word or phrase as it appears in translatedText, if present.

    Only include vocabularyHighlights for vocabulary whose meaning appears in the translatedText.
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
    console.error("AI fragment translation error:", error);
    res.status(500).json({ error: "Failed to translate fragment" });
  }
}
