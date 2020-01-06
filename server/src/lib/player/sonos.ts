import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { externalIp, port } from '../../config';
import { Song } from '../library';
import { logger } from '../log';
import { Settings, SonosGroup } from '../settings';
import { Player, SongEvent, SongFinishedEvent, SongStartedEvent } from './api';

const log = logger.child({ module: 'player_sonos' });

const endpoint = `http://${externalIp}:${port}`;

export class SonosPlayer implements Player {
  private readonly group = new BehaviorSubject<SonosGroup | undefined>(undefined);
  readonly requiresPower = false;
  readonly events = new Subject<SongEvent>();
  private currentSong?: { song: Song; playing: boolean };

  constructor(settings: Observable<Settings>, songGroups: Observable<SonosGroup[]>) {
    combineLatest(settings.pipe(map(s => (s.output.type === 'sonos' ? s.output.groupId : ''))), songGroups)
      .pipe(map(([groupId, groups]) => groups.find(g => g.id === groupId)))
      .subscribe(group => this.group.next(group));

    this.group.pipe(filter(g => !!g)).subscribe(({ coordinator }) => {
      coordinator.on('AVTransport', async ({ TransportState }) => {
        if (this.currentSong) {
          if (TransportState === 'PLAYING' && !this.currentSong.playing) {
            log.info('song started: %s', this.currentSong.song.id);
            this.currentSong.playing = true;
            this.events.next(new SongStartedEvent(this.currentSong.song));
          }

          if (TransportState === 'STOPPED' && this.currentSong.playing) {
            log.info('song stopped: %s', this.currentSong.song.id);
            this.events.next(new SongFinishedEvent(this.currentSong.song));
            this.currentSong = undefined;
          }
        }
      });
    });
  }

  async play(song: Song): Promise<any> {
    const group = this.group.value;
    if (!group) throw new Error('No Sonos group configured or available');
    const songUrl = this.getUrl(song);
    log.info('playing song %s from %s in group %s', song.id, songUrl, group.id);
    this.currentSong = { song, playing: false };
    await group.coordinator.setAVTransportURI(songUrl);
  }

  async stop(): Promise<any> {
    log.info('stopping');
    const group = this.group.value;
    if (!group) return;
    await group.coordinator.stop();
    if (this.currentSong) this.events.next(new SongFinishedEvent(this.currentSong.song));
    this.currentSong = undefined;
  }

  private getUrl(song: Song) {
    return `${endpoint}/songs/${song.id}.mp3`;
  }
}
