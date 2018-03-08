import { injectable } from 'inversify';
import * as fs from 'fs';

import * as pkg from '../package.json';

export interface BuildInfo {
  timestamp: string;
  branch: string;
  commit: string;
}

export interface Configuration {
  version: string;
  buildInfo?: BuildInfo;
}

export const ConfigurationSymbol = Symbol.for('Configuration');

@injectable()
export class ConfigurationImpl implements Configuration {
  version = pkg.version;
  buildInfo = readBuildInfo();
}

function readBuildInfo(): BuildInfo | undefined {
  try {
    return JSON.parse(fs.readFileSync('build-info.json', 'utf-8'));
  } catch (err) {
    console.warn('No build info available.');
  }
}
