import { parseBlob } from 'music-metadata-browser';

export async function readMp3Tags(file) {
  try {
    return await parseBlob(file);
  } catch (error) {
    console.error('Error parsing tags:', error);
    return {};
  }
}
