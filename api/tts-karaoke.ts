import { buildWordTimings } from "../src/lib/karaoke";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY" });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
    const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
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
      return res.status(response.status).json({ error: "ElevenLabs request failed", detail });
    }

    const data = await response.json();
    const alignment = data.alignment || data.normalized_alignment;
    res.status(200).json({
      audioUrl: `data:audio/mpeg;base64,${data.audio_base64}`,
      words: buildWordTimings(alignment),
    });
  } catch (error) {
    console.error("ElevenLabs karaoke error:", error);
    res.status(500).json({ error: "Failed to generate karaoke audio" });
  }
}
