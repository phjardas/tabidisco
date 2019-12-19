import mp3 from 'mp3-parser';

const tagMappings = [
  { field: 'title', frames: ['TIT1', 'TIT2'] },
  { field: 'artist', frames: ['TPE1', 'TPE2'] },
  { field: 'album', frames: ['TALB'] },
];

export async function readMp3Tags(file) {
  const buffer = await readBuffer(file);
  const frames = mp3
    .readTags(new DataView(buffer))
    .flatMap((tag) =>
      (tag.frames || []).filter((frame) => frame.content).map((frame) => ({ id: frame.header.id, value: frame.content.text || frame.content.value }))
    )
    .filter((t) => typeof t.value !== 'undefined' && t.value !== '')
    .reduce((acc, b) => ({ ...acc, [b.id]: [...(acc[b.id] || []), b.value] }), {});
  console.debug('frames:', frames);

  const tags = {};
  tagMappings.forEach((tm) => {
    const frameId = tm.frames.find((frame) => frame in frames);
    if (frameId) tags[tm.field] = frames[frameId][0];
  });
  return tags;
}

function readBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (e) => reject(e.target.error);
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsArrayBuffer(file);
  });
}
