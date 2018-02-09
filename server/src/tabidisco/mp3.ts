import { Observable } from 'rxjs';
import * as mp3 from 'mp3-parser';

import { SongTags } from './api';
import { readFile } from './io';

interface TagMapping {
  readonly field: keyof SongTags;
  readonly frames: string[];
}

const tagMappings: TagMapping[] = [
  { field: 'title', frames: ['TIT1', 'TIT2'] },
  { field: 'artist', frames: ['TPE1', 'TPE2'] },
  { field: 'album', frames: ['TALB'] },
];

type FrameValue = { id: string; value?: any };
type FramesById = { [frameId: string]: string[] };

function parseFramesById(filename: string): Observable<FramesById> {
  return readFile<Buffer>(filename).map(data => {
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
  });
}

export function parseTags(filename: string): Observable<SongTags> {
  return parseFramesById(filename).map(frames => {
    const tags: SongTags = {};
    tagMappings.forEach(tm => {
      const frameId = tm.frames.find(frame => frame in frames);
      if (frameId) tags[tm.field] = frames[frameId][0];
    });
    return tags;
  });
}
