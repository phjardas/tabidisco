import * as fs from 'fs';
import * as mp3 from 'mp3-parser';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export interface SongTags {
  title?: string;
  artist?: string;
  album?: string;
}

interface TagMapping {
  readonly field: keyof SongTags;
  readonly frames: string[];
}

// FIXME read song length from mp3 tags
const tagMappings: TagMapping[] = [
  { field: 'title', frames: ['TIT1', 'TIT2'] },
  { field: 'artist', frames: ['TPE1', 'TPE2'] },
  { field: 'album', frames: ['TALB'] },
];

type FrameValue = { id: string; value?: any };
type FramesById = { [frameId: string]: string[] };

async function parseFramesById(filename: string): Promise<FramesById> {
  const data = await readFile(filename);
  const tags = mp3.readTags(new DataView(data.buffer));
  const frames: FrameValue[] = tags
    .map(tag => (tag.frames || []).map(frame => ({ id: frame.header.id, value: frame.content.text || frame.content.value })))
    .reduce((a, b) => [...a, ...b])
    .filter(t => typeof t.value !== 'undefined');
  const reducer: (acc: FramesById, v: FrameValue) => FramesById = (acc, b) => ({
    ...acc,
    [b.id]: [...(acc[b.id] || []), b.value],
  });
  return frames.reduce(reducer, {});
}

export async function parseTags(filename: string): Promise<SongTags> {
  const frames = await parseFramesById(filename);
  const tags: SongTags = {};
  tagMappings.forEach(tm => {
    const frameId = tm.frames.find(frame => frame in frames);
    if (frameId) tags[tm.field] = frames[frameId][0];
  });
  return tags;
}
