import { Observable, Observer } from 'rxjs';
import * as fs from 'fs';

export function readFile<T extends string | Buffer>(filename: string, encoding?: string): Observable<T> {
  return Observable.create((obs: Observer<any>) =>
    fs.readFile(filename, encoding, (err, data: T) => {
      if (err && err.code !== 'ENOENT') return obs.error(err);
      obs.next(data);
      obs.complete();
    })
  );
}

export function writeFile(filename: string, data: Buffer | string, encoding?: string): Observable<any> {
  return Observable.create((obs: Observer<any>) =>
    fs.writeFile(filename, data, encoding, err => {
      if (err) return obs.error(err);
      obs.next(null);
      obs.complete();
    })
  );
}

export function deleteFile(filename: string): Observable<any> {
  return Observable.create((obs: Observer<any>) =>
    fs.unlink(filename, err => {
      if (err) return obs.error(err);
      obs.next(null);
      obs.complete();
    })
  );
}
