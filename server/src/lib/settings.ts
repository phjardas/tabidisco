import { mkdirp, readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { DeviceDiscovery } from 'sonos';

export interface Settings {
  output: OutputChannel;
}

export type OutputChannel = { type: 'local' } | { type: 'sonos'; groupId: string };

export interface SonosCoordinator {
  setAVTransportURI(options: string | { uri: string; metadata: any }): Promise<any>;
  stop(): Promise<any>;
  on(type: 'AVTransport', listener: (event: { TransportState: string; CurrentTrackURI: string }) => any): void;
  currentTrack(): Promise<{ uri: string }>;
}

export interface SonosGroup {
  id: string;
  name: string;
  coordinator: SonosCoordinator;
}

export type SettingsEvent = { type: 'settings'; settings: Settings };
export type SonosGroupsEvent = { type: 'sonosGroups'; sonosGroups: SonosGroup[] };

const defaultSettings: Settings = {
  output: { type: 'local' },
};

function observeSonosGroups(): Observable<SonosGroup[]> {
  return Observable.create((observer: Observer<SonosGroup[]>) => {
    DeviceDiscovery(async (device: any) => {
      try {
        const groups: any[] = await device.getAllGroups();
        const sonosGroups = await Promise.all(groups.map(createSonosGroup));
        observer.next(sonosGroups.sort((a, b) => a.id.localeCompare(b.id)));
      } catch (error) {
        observer.error(error);
      }
    });
  });
}

async function createSonosGroup(data: any): Promise<SonosGroup> {
  return {
    id: data.ID,
    name: data.Name.replace(/ \+ \d+$/, ''),
    coordinator: await data.CoordinatorDevice(),
  };
}

export class SettingsManager {
  private readonly settingsFile: string;
  private readonly eventsSubject = new Subject<SettingsEvent | SonosGroupsEvent>();
  readonly events = this.eventsSubject.asObservable();
  readonly settings = new BehaviorSubject<Settings>(defaultSettings);
  readonly sonosGroups = observeSonosGroups();

  constructor() {
    this.settingsFile = path.resolve(process.env.TABIDISCO_DB_DIR || path.resolve('db'), 'settings.json');
    this.loadSettings()
      .then(s => this.settings.next(s))
      .catch(error => this.settings.error(error));
    this.events.pipe(filter(e => e.type === 'settings')).subscribe((s: SettingsEvent) => this.settings.next(s.settings));
    this.sonosGroups.subscribe(sonosGroups => this.eventsSubject.next({ type: 'sonosGroups', sonosGroups }));
  }

  async updateSettings(updater: (s: Settings) => Settings): Promise<Settings> {
    const current = await this.settings.pipe(first()).toPromise();
    const next = updater(current);
    return this.writeSettings(next);
  }

  private async loadSettings(): Promise<Settings> {
    try {
      const content = await readFile(this.settingsFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return defaultSettings;
      }
      throw error;
    }
  }

  private async writeSettings(settings: Settings): Promise<Settings> {
    await mkdirp(path.dirname(this.settingsFile));
    await writeFile(this.settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    this.eventsSubject.next({ type: 'settings', settings });
    return settings;
  }
}
