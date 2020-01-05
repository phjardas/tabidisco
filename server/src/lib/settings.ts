import { mkdirp, readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { DeviceDiscovery } from 'sonos';

export interface Settings {
  output: OutputChannel;
}

export type OutputChannel = { type: 'local' } | { type: 'sonos'; groupId: string };

export interface SonosGroup {
  id: string;
  name: string;
}

export type SettingsEvent = { type: 'settings'; settings: Settings };

const defaultSettings: Settings = {
  output: { type: 'local' },
};

function observeSonosGroups(): Observable<SonosGroup[]> {
  return Observable.create((observer: Observer<SonosGroup[]>) => {
    DeviceDiscovery(async (device: any) => {
      try {
        const groups = await device.getAllGroups();
        const sonosGroups: SonosGroup[] = groups.map((group: any) => ({ id: group.ID, name: group.Name.replace(/ \+ \d+$/, '') }));
        observer.next(sonosGroups.sort((a, b) => a.id.localeCompare(b.id)));
      } catch (error) {
        observer.error(error);
      }
    });
  });
}

export class SettingsManager {
  private readonly settingsFile: string;
  private readonly eventsSubject = new Subject<SettingsEvent>();
  readonly events = this.eventsSubject.asObservable();
  readonly settings = new BehaviorSubject<Settings>(defaultSettings);
  readonly sonosGroups = observeSonosGroups();

  constructor() {
    this.settingsFile = path.resolve(process.env.TABIDISCO_DB_DIR || path.resolve('db'), 'settings.json');
    this.loadSettings()
      .then(s => this.settings.next(s))
      .catch(error => this.settings.error(error));
    this.events.subscribe(s => this.settings.next(s.settings));
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
