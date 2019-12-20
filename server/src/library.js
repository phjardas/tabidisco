import AsyncLock from 'async-lock';
import fs from 'fs-extra';
import path from 'path';
import { ulid } from 'ulid';
import getMp3Duration from 'mp3-duration';

const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '..', 'data');
const dataFile = path.resolve(dataDir, 'data.json');
const lock = new AsyncLock();
const locked = (task) => lock.acquire('data', task);

const listeners = [];
export function registerListener(listener) {
  listeners.push(listener);
}
function emit(type, medium) {
  listeners.forEach((listener) => listener({ type, medium }));
}

export async function getMedia() {
  const { media } = await readDatabase();
  return media;
}

export async function findMedium(id) {
  const media = await getMedia();
  const medium = media.find((m) => m.id === id);
  if (!medium) return null;

  return {
    ...medium,
    createAudioStream: () => fs.createReadStream(path.resolve(dataDir, medium.file.filename)),
  };
}

export async function createMedium({ title, file, image }) {
  return locked(async () => {
    const db = await readDatabase();
    const id = ulid();
    const fileData = await writeFile(id, await file);
    const imageData = await writeFile(id, await image);
    const duration = await getDuration(fileData);
    const medium = { id, title, duration, file: fileData, image: imageData };
    await writeDatabase({ ...db, media: [...db.media, medium] });
    emit('created', medium);

    return medium;
  });
}

async function getDuration({ filename }) {
  try {
    const duration = await getMp3Duration(path.resolve(dataDir, filename));
    return Math.ceil(duration);
  } catch (error) {
    console.error('Error getting MP3 duration:', error);
  }
}

export async function deleteMedium(id) {
  return locked(async () => {
    const db = await readDatabase();
    const medium = db.media.find((m) => m.id === id);
    if (medium) {
      await Promise.all([medium.file, medium.image].map(deleteFile));
      await writeDatabase({ ...db, media: db.media.filter((m) => m.id !== id) });
      emit('deleted', medium);
      return medium;
    }
  });
}

async function writeFile(id, { mimetype, createReadStream }) {
  return new Promise((resolve, reject) => {
    const filename = `${id}.${getFileExtension(mimetype)}`;
    const fileOut = fs.createWriteStream(path.resolve(dataDir, filename));
    fileOut.on('error', reject);
    fileOut.on('finish', () => resolve({ filename, type: mimetype }));
    createReadStream().pipe(fileOut);
  });
}

async function deleteFile({ filename }) {
  await fs.unlink(path.resolve(dataDir, filename));
}

export async function getImage(medium) {
  const filename = path.resolve(dataDir, medium.image.filename);
  if (!(await fs.pathExists(filename))) return null;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filename);
    const chunks = [];
    stream.on('error', reject);
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => {
      const data = Buffer.concat(chunks).toString('base64');
      resolve(`data:${medium.image.type};base64,${data}`);
    });
  });
}

export function getAudioStream(medium) {
  return fs.createReadStream(path.resolve(dataDir, medium.file.filename));
}

function getFileExtension(mimetype) {
  switch (mimetype) {
    case 'audio/mp3':
      return 'mp3';
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    default:
      throw new Error(`Cannot determine file extension for MIME type: "${mimetype}"`);
  }
}

async function readDatabase() {
  await fs.mkdirs(path.dirname(dataFile));

  if (await fs.pathExists(dataFile)) {
    return fs.readJSON(dataFile);
  }

  return { media: [] };
}

async function writeDatabase(data) {
  await fs.writeJSON(dataFile, data, { spaces: 2 });
}
