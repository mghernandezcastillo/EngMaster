const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/feedback', async (req, res) => {
  try {
    const { text, userAttempt, language } = req.body;
    if (!text || !userAttempt) {
      return res.status(400).json({ error: 'Missing text or userAttempt' });
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
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

app.post('/api/translate', async (req, res) => {
  try {
    const { word, context, language } = req.body;
    if (!word) {
      return res.status(400).json({ error: 'Missing word' });
    }
    
    const prompt = `
    Translate the English word "${word}" into ${language === 'es' ? 'Spanish' : 'English'}.
    Context sentence: "${context || ''}"
    
    Provide a highly concise response formatted in JSON with the keys:
    - translation (string, just the translated word or very short phrase)
    - phonetics (string, IPA pronunciation of the original English word "${word}", not of the translation)
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error('AI translation error:', error);
    res.status(500).json({ error: 'Failed to generate translation' });
  }
});

app.post('/api/translate-fragment', async (req, res) => {
  try {
    const { text, vocabulary } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
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
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error('AI fragment translation error:', error);
    res.status(500).json({ error: 'Failed to translate fragment' });
  }
});

module.exports = app;
