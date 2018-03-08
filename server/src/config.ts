import { injectable } from 'inversify';
import * as getRepoInfo from 'git-repo-info';

import * as pkg from '../package.json';

export interface BuildInfo {
  branch: string;
  commit: string;
}

export interface Configuration {
  version: string;
  buildInfo: BuildInfo;
}

export const ConfigurationSymbol = Symbol.for('Configuration');

@injectable()
export class ConfigurationImpl implements Configuration {
  version = (pkg as any).version;
  buildInfo = readBuildInfo();
}

function readBuildInfo(): BuildInfo {
  const info = getRepoInfo();
  return { commit: info.abbreviatedSha, branch: info.branch };
}
