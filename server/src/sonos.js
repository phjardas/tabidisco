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
  const metadata = Helpers.GenerateCustomMetadata(mediumUrl, medium.id, getDuration(medium.duration), medium.title, medium.artist, undefined, coverUrl);
  console.log('[sonos] metadata:', metadata);
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

function attachCoordinatorListener(coordinator) {
  const listener = async ({ TransportState, CurrentTrackURI }) => {
    if (CurrentTrackURI.startsWith(endpoint)) {
      console.log('[sonos] received update: %s %s', TransportState, CurrentTrackURI);
      const media = await getMedia();
      const medium = media.find((m) => getMediumUrl(m) === CurrentTrackURI);
      if (medium) {
        const track = await coordinator.currentTrack();
        console.log('[sonos] current track: %s', track.uri);

        if (track.uri === CurrentTrackURI) {
          playback =
            TransportState === 'STOPPED'
              ? null
              : {
                  paused: TransportState === 'PAUSED_PLAYBACK',
                  medium,
                };
          emitPlayback();
          return;
        }
      }
    }
  };

  console.log('[sonos] adding listener to coordinator %s:%s', coordinator.host, coordinator.port);
  coordinator.on('AVTransport', listener);

  return () => {
    console.log('[sonos] removing listener from coordinator %s:%s', coordinator.host, coordinator.port);
    coordinator.off('AVTransport', listener);
  };
}

function getSonosGroups() {
  const listeners = {};
  const emit = (type, ...args) => (listeners[type] || []).forEach((listener) => listener(...args));

  let coordinatorListener = null;

  let current = {
    id: 'sonos',
    selectedGroup: null,
    groups: [],
    coordinator: null,
  };

  const selectCoordinator = async (groups, groupId) => {
    const group = groups.find((g) => g.id === groupId);

    if (group) {
      const coordinator = await group._group.CoordinatorDevice();

      if (current.coordinator) {
        if (current.coordinator.host === coordinator.host && current.coordinator.port === coordinator.port) {
          return current.coordinator;
        }

        coordinatorListener && coordinatorListener();
      }

      coordinatorListener = attachCoordinatorListener(coordinator);
      return coordinator;
    } else if (coordinatorListener) {
      coordinatorListener();
      coordinatorListener = null;
    }
  };

  const setSelectedGroup = async (id, skipConfigWrite) => {
    console.log('[sonos] set group: %s', id);

    current = {
      ...current,
      selectedGroup: id,
      coordinator: await selectCoordinator(current.groups, id),
    };

    if (!skipConfigWrite) await updateConfig('sonosGroupId', id);
    emit('change', current);
    return current;
  };

  getConfig().then((config) => config.sonosGroupId && setSelectedGroup(config.sonosGroupId, true));

  DeviceDiscovery(async (device) => {
    const sonosGroups = await device.getAllGroups();
    const groups = sonosGroups.map((g) => ({ id: g.ID, label: g.Name.replace(/ \+ \d+$/, ''), _group: g })).sort((a, b) => a.label.localeCompare(b.label));

    current = {
      ...current,
      groups,
      coordinator: await selectCoordinator(groups, current.selectedGroup),
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
  const config = await getConfig();
  config[key] = value;
  writeJSON(configFile, config);
}
