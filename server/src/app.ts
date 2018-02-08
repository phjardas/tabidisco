import { Jukebox } from './jukebox/jukebox';
import { FileLibrary } from './jukebox/library';

export const library = new FileLibrary('db/songs.json');
export const jukebox = new Jukebox(library);
jukebox.on('log', (level, message, ...args) => console.log(message, ...args));
