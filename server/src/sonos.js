import { readJSON, writeJSON } from 'fs-extra';
import os from 'os';
import path from 'path';
import { DeviceDiscovery, Helpers } from 'sonos';
import { dataDir, port } from './config';
import { getMedia } from './library';

const configFile = path.resolve(dataDir, 'config.json');
const endpoint = `http://${getExternalIp()}:${port}/media`;

let playback = null;

const listeners = {};
export function on(type, listener) {
  (listeners[type] = listeners[type] || []).push(listener);
}
function emit(type, ...args) {
  listeners[type].forEach((listener) => listener(...args));
}
function emitPlayback() {
  emit('playback', playback);
}

export async function getPlayback() {
  return playback;
}

export async function play(medium) {
  const c = groups.current.coordinator;
  if (!c) throw new Error('No Sonos group selected');
  const mediumUrl = getMediumUrl(medium);
  const coverUrl = getMediumCoverUrl(medium);
  console.log('[sonos] playing medium from %s', mediumUrl);
  // FIXME Sonos does not seem to accept our metadata
  const metadata = Helpers.GenerateCustomMetadata(mediumUrl, medium.id, getDuration(medium.duration), medium.title, undefined, undefined, coverUrl);
  await c.setAVTransportURI({ uri: mediumUrl, metadata });
  playback = { paused: false, medium };
  emitPlayback();
}

export async function stop() {
  const c = groups.current.coordinator;
  if (c) {
    console.log('[sonos] stopping playback');
    await c.stop();
  }
}

export async function pause() {
  const c = groups.current.coordinator;
  if (c) {
    console.log('[sonos] pausing playback');
    await c.pause();
  }
}

export async function resume() {
  const c = groups.current.coordinator;
  if (c) {
    console.log('[sonos] resuming playback');
    await c.play();
  }
}

function getMediumUrl(medium) {
  return `${endpoint}/${medium.id}.mp3`;
}

function getMediumCoverUrl(medium) {
  return `${endpoint}/${medium.id}/cover`;
}

function getExternalIp() {
  const ifaces = os.networkInterfaces();
  const iface = Object.values(ifaces)
    .flatMap((iface) => iface)
    .find((iface) => iface.family === 'IPv4' && !iface.internal);
  return iface ? iface.address : 'localhost';
}

function getDuration(seconds) {
  let remaining = seconds;
  const hours = Math.floor(remaining / 3600);
  remaining = remaining - hours * 3600;
  const minutes = Math.floor(remaining / 60);
  remaining = remaining - minutes * 60;

  return [hours.toString(), minutes.toString(), remaining.toString()].map((s) => s.padStart(2, '0')).join(':');
}

const groups = getSonosGroups();
groups.on('change', (...args) => emit('groups', ...args));

export function getGroups() {
  return groups.current;
}

function getSonosGroups() {
  const listeners = {};
  const emit = (type, ...args) => (listeners[type] || []).forEach((listener) => listener(...args));

  let current = {
    id: 'sonos',
    selectedGroup: null,
    groups: [],
    coordinator: null,
  };

  const setSelectedGroup = async (id, skipConfigWrite) => {
    console.log('[sonos] set group: %s', id);
    const group = current.groups.find((g) => g.id === id);
    const coordinator = group ? await group._group.CoordinatorDevice() : null;

    current = {
      ...current,
      coordinator,
      selectedGroup: id,
    };
    if (!skipConfigWrite) await updateConfig('sonosGroupId', id);
    emit('change', current);
    return current;
  };

  getConfig().then((config) => config.sonosGroupId && setSelectedGroup(config.sonosGroupId, true));

  DeviceDiscovery(async (device) => {
    const sonosGroups = await device.getAllGroups();
    const groups = sonosGroups.map((g) => ({ id: g.ID, label: g.Name, _group: g })).sort((a, b) => a.label.localeCompare(b.label));
    const group = groups.find((g) => g.id === current.selectedGroup);
    const coordinator = group ? await group._group.CoordinatorDevice() : null;

    current = {
      ...current,
      groups,
      coordinator,
    };
    emit('change', current);
  });

  return {
    get current() {
      return current;
    },
    on: (type, listener) => (listeners[type] = listeners[type] || []).push(listener),
    setSelectedGroup,
  };
}

export function setSonosGroup(id) {
  return groups.setSelectedGroup(id);
}

async function getConfig() {
  try {
    return await readJSON(configFile);
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function updateConfig(key, value) {
  const config = await readJSON(configFile);
  config[key] = value;
  writeJSON(configFile, config);
}

function subscribeCoordinator(coordinator) {
  const listener = async ({ TransportState, CurrentTrackURI }) => {
    if (['PLAYING', 'PAUSED_PLAYBACK', 'TRANSITIONING'].includes(TransportState) && CurrentTrackURI.startsWith(endpoint)) {
      console.log('[sonos] received update: %s %s', TransportState, CurrentTrackURI);
      const media = await getMedia();
      const medium = media.find((m) => getMediumUrl(m) === CurrentTrackURI);
      if (medium) {
        const track = await coordinator.currentTrack();
        console.log('[sonos] current track: %s', track.uri);
        if (track.uri === CurrentTrackURI) {
          playback = {
            paused: TransportState === 'PAUSED_PLAYBACK',
            medium,
          };
          emitPlayback();
          return;
        }
      }
    }
  };

  coordinator.on('AVTransport', listener);
}
