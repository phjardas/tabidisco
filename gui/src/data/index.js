import React from 'react';
import { ApolloProvider } from './apollo';
import { PlaybackProvider } from './playback';
import { LibraryProvider } from './library';
import { ThemeProvider } from './theme';

export { usePlayback } from './playback';
export { useLibrary } from './library';

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
