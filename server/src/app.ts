import { Jukebox } from './jukebox/jukebox';
import { MemoryLibrary } from './jukebox/library';

export const library = new MemoryLibrary();
library.setSong({ tokenId: 'aaa', filename: 'aaa.mp3' });
library.setSong({ tokenId: 'bbb', filename: 'bbb.mp3' });
library.setSong({ tokenId: 'ccc', filename: 'ccc.mp3' });

export const jukebox = new Jukebox(library);
jukebox.on('log', (level, message, ...args) => console.log(message, ...args));
