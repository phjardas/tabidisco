import React, { useCallback } from 'react';
import Container from '../components/Container';
import MediaGrid from '../components/MediaGrid';
import WithLibrary from '../components/WithLibrary';
import { usePlayback } from '../data';

function Library({ library }) {
  const { play } = usePlayback();

  const doPlay = useCallback(
    async (medium) => {
      const result = await play(medium.id);
      if (!result.data.play.success) {
        console.error('Error playing medium:', result.data.play);
      }
    },
    [play]
  );

  return <MediaGrid media={library.media} onClick={doPlay} />;
}

export default function LibraryPage() {
  return (
    <Container>
      <WithLibrary>{({ library }) => <Library library={library} />}</WithLibrary>
    </Container>
  );
}
