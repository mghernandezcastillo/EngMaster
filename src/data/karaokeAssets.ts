import { KaraokePayload } from '../lib/karaoke';

export type LocalKaraokeAsset = {
  audioUrl: string;
  timingsUrl: string;
};

export const karaokeAssets: Record<string, LocalKaraokeAsset> = {
  "lesson-1:full": {
    "audioUrl": "/audio/karaoke/lesson-1/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-1/full.json"
  },
  "lesson-2:full": {
    "audioUrl": "/audio/karaoke/lesson-2/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-2/full.json"
  },
  "lesson-3:full": {
    "audioUrl": "/audio/karaoke/lesson-3/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-3/full.json"
  },
  "lesson-4:full": {
    "audioUrl": "/audio/karaoke/lesson-4/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-4/full.json"
  },
  "lesson-5:full": {
    "audioUrl": "/audio/karaoke/lesson-5/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-5/full.json"
  },
  "lesson-6:full": {
    "audioUrl": "/audio/karaoke/lesson-6/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-6/full.json"
  },
  "lesson-7:full": {
    "audioUrl": "/audio/karaoke/lesson-7/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-7/full.json"
  },
  "lesson-8:full": {
    "audioUrl": "/audio/karaoke/lesson-8/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-8/full.json"
  },
  "lesson-9:full": {
    "audioUrl": "/audio/karaoke/lesson-9/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-9/full.json"
  },
  "lesson-10:full": {
    "audioUrl": "/audio/karaoke/lesson-10/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-10/full.json"
  },
  "lesson-11:full": {
    "audioUrl": "/audio/karaoke/lesson-11/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-11/full.json"
  },
  "lesson-12:full": {
    "audioUrl": "/audio/karaoke/lesson-12/full.mp3",
    "timingsUrl": "/audio/karaoke/lesson-12/full.json"
  }
};

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
