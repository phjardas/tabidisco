import os from 'os';
import { DeviceDiscovery, Helpers } from 'sonos';
import { port } from './config';
import { getMedia } from './library';

const endpoint = `http://${getExternalIp()}:${port}/media`;
const groupName = 'Wohnzimmer + 1';
let playback = null;

const listeners = [];
export function registerListener(listener) {
  listeners.push(listener);
}
function emit() {
  listeners.forEach((listener) => listener(playback));
}

export async function getPlayback() {
  return playback;
}

export async function play(medium) {
  const g = await group;
  const mediumUrl = getMediumUrl(medium);
  const coverUrl = getMediumCoverUrl(medium);
  // FIXME Sonos does not seem to accept our metadata
  const metadata = Helpers.GenerateCustomMetadata(mediumUrl, medium.id, getDuration(medium.duration), medium.title, undefined, undefined, coverUrl);
  await g.CoordinatorDevice().setAVTransportURI({ uri: mediumUrl, metadata });
  playback = { paused: false, elapsedSeconds: 0, medium };
  emit();
}

export async function stop() {
  const g = await group;
  await g.CoordinatorDevice().stop();
}

export async function pause() {
  const g = await group;
  await g.CoordinatorDevice().pause();
}

export async function resume() {
  const g = await group;
  await g.CoordinatorDevice().play();
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

const group = getSonosGroup(groupName);

async function getSonosGroup(groupName) {
  return new Promise((resolve, reject) => {
    let settled = false;

    try {
      DeviceDiscovery(async (device) => {
        if (settled) return;
        const groups = await device.getAllGroups();
        if (settled) return;
        settled = true;
        const group = groups.find((group) => group.Name === groupName);
        if (!group) return reject(new Error(`Sonos group not found: "${groupName}"`));

        const coordinator = group.CoordinatorDevice();
        coordinator.on('AVTransport', async ({ TransportState, CurrentTrackURI }) => {
          if (['PLAYING', 'PAUSED_PLAYBACK', 'TRANSITIONING'].includes(TransportState) && CurrentTrackURI.startsWith(endpoint)) {
            const media = await getMedia();
            const medium = media.find((m) => getMediumUrl(m) === CurrentTrackURI);
            if (medium) {
              const track = await coordinator.currentTrack();
              if (track.uri === CurrentTrackURI) {
                playback = {
                  elapsedSeconds: track.position,
                  paused: TransportState === 'PAUSED_PLAYBACK',
                  medium,
                };
                emit();
                return;
              }
            }
          }

          playback = null;
          emit();
        });

        resolve(group);
      });
    } catch (error) {
      if (!settled) {
        settled = true;
        reject(error);
      }
    }
  });
}
