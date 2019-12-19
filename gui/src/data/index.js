import React from 'react';
import { ApolloProvider } from './apollo';
import { LibraryProvider } from './library';
import { PlaybackProvider } from './playback';
import { ThemeProvider } from './theme';

export { useLibrary } from './library';
export * from './mp3';
export { usePlayback } from './playback';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ApolloProvider>
        <PlaybackProvider>
          <LibraryProvider>{children}</LibraryProvider>
        </PlaybackProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}
