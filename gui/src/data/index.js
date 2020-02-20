import React from 'react';
import { ApolloProvider } from './apollo';
import { LibraryProvider } from './library';
import { PlaybackProvider } from './playback';
import { SonosProvider } from './sonos';
import { ThemeProvider } from './theme';

export { useLibrary } from './library';
export * from './mp3';
export { usePlayback } from './playback';
export { useSonos } from './sonos';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ApolloProvider>
        <SonosProvider>
          <PlaybackProvider>
            <LibraryProvider>{children}</LibraryProvider>
          </PlaybackProvider>
        </SonosProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}
