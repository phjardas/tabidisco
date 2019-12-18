import path from 'path';
import fs from 'fs-extra';
import AsyncLock from 'async-lock';

const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '..', 'data');
const dataFile = path.resolve(dataDir, 'data.json');
const lock = new AsyncLock();
const locked = (task) => lock.acquire('data', task);

export async function getMedia() {
  const { media } = await readDatabase();
  return media;
}

export async function findMedium(id) {
  const media = await getMedia();
  return media.find((m) => m.id === id);
}

async function readDatabase() {
  if (await fs.pathExists(dataFile)) {
    const data = await fs.readJSON(dataFile);
    return {
      ...data,
      media: (data.media || []).map((medium) => ({ ...medium, file: path.resolve(dataDir, medium.filename) })),
    };
  }

  return { media: [] };
}

async function writeDatabase(data) {
  await fs.mkdirs(path.dirname(dataFile));
  await fs.writeJSON(dataFile, data);
}
