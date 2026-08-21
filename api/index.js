const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildWordTimings(alignment) {
  if (!alignment?.characters?.length) return [];

  const characters = alignment.characters;
  const starts = alignment.character_start_times_seconds || [];
  const ends = alignment.character_end_times_seconds || [];
  const text = characters.join('');
  const words = [];
  const wordRegex = /\b[\w'-]+\b/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const charStart = match.index;
    const charEnd = match.index + match[0].length - 1;
    const start = starts[charStart];
    const end = ends[charEnd] ?? starts[charEnd];

    if (typeof start === 'number' && typeof end === 'number') {
      words.push({ word: match[0], start, end, charIndex: charStart });
    }
  }

  return words;
}

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
    const { word, context, language = 'es' } = req.body;
    if (!word) {
      return res.status(400).json({ error: 'Missing word' });
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

app.post('/api/tts-karaoke', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY' });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({ error: 'ElevenLabs request failed', detail });
    }

    const data = await response.json();
    const alignment = data.alignment || data.normalized_alignment;
    res.json({
      audioUrl: `data:audio/mpeg;base64,${data.audio_base64}`,
      words: buildWordTimings(alignment),
    });
  } catch (error) {
    console.error('ElevenLabs karaoke error:', error);
    res.status(500).json({ error: 'Failed to generate karaoke audio' });
  }
});

module.exports = app;
