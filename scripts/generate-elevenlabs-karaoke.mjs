import fs from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { lessons } from '../src/data/lessons.ts';
import { buildWordTimings } from '../src/lib/karaoke.ts';

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const outputRoot = path.resolve('public/audio/karaoke');
const assetModulePath = path.resolve('src/data/karaokeAssets.ts');

if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY. Set it in your environment before running this script.');
  process.exit(1);
}

function getFragments(text) {
  return text
    .match(/[^.?!]+[.?!]+(?:\s+|$)|.+/g)
    ?.map(s => s.trim())
    .filter(Boolean) || [text];
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateKaraoke(text) {
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
    throw new Error(`ElevenLabs failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const alignment = data.alignment || data.normalized_alignment;
  return {
    audio: Buffer.from(data.audio_base64, 'base64'),
    words: buildWordTimings(alignment),
  };
}

async function writeAsset(assetKey, text, lessonDir, fileStem, manifest) {
  const audioPath = path.join(lessonDir, `${fileStem}.mp3`);
  const jsonPath = path.join(lessonDir, `${fileStem}.json`);
  const publicAudioUrl = `/audio/karaoke/${path.basename(lessonDir)}/${fileStem}.mp3`;
  const publicJsonUrl = `/audio/karaoke/${path.basename(lessonDir)}/${fileStem}.json`;

  if (!(await fileExists(audioPath)) || !(await fileExists(jsonPath))) {
    console.log(`Generating ${assetKey}`);
    const result = await generateKaraoke(text);
    await fs.writeFile(audioPath, result.audio);
    await fs.writeFile(jsonPath, JSON.stringify(result.words, null, 2));
  } else {
    console.log(`Skipping existing ${assetKey}`);
  }

  manifest[assetKey] = {
    audioUrl: publicAudioUrl,
    timingsUrl: publicJsonUrl,
  };
}

async function main() {
  const manifest = {};
  await fs.mkdir(outputRoot, { recursive: true });

  for (const lesson of lessons) {
    const fragments = getFragments(lesson.text);
    const lessonDir = path.join(outputRoot, lesson.id);
    await fs.mkdir(lessonDir, { recursive: true });

    await writeAsset(`${lesson.id}:full`, lesson.text, lessonDir, 'full', manifest);
  }

  const moduleContent = `import { KaraokePayload } from '../lib/karaoke';

export type LocalKaraokeAsset = {
  audioUrl: string;
  timingsUrl: string;
};

export const karaokeAssets: Record<string, LocalKaraokeAsset> = ${JSON.stringify(manifest, null, 2)};

export async function loadLocalKaraokeAsset(key: string): Promise<KaraokePayload | null> {
  const asset = karaokeAssets[key];
  if (!asset) return null;

  const response = await fetch(asset.timingsUrl);
  if (!response.ok) return null;

  const words = await response.json();
  return {
    audioUrl: asset.audioUrl,
    words,
  };
}
`;

  await fs.writeFile(assetModulePath, moduleContent);
  console.log(`Generated ${Object.keys(manifest).length} karaoke assets.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
