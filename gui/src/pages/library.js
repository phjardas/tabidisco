import { Button, makeStyles } from '@material-ui/core';
import React, { useCallback, useMemo } from 'react';
import { useLibrary, usePlayback } from '../data';

function Library({ library }) {
  const classes = useStyles();
  const media = useMemo(() => [...library.media].sort((a, b) => a.title.localeCompare(b.title)), [library.media]);
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

  return (
    <div className={classes.grid}>
      <div className={classes.sizingTile} />
      {media.map((medium) => (
        <Button key={medium.id} className={classes.tile} style={{ backgroundImage: `url(${medium.image})` }} onClick={() => doPlay(medium)}>
          <span className={classes.title}>{medium.title}</span>
        </Button>
      ))}
    </div>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  grid: {
    display: 'grid',
    gap: `${spacing(2)}px`,
    margin: spacing(2),
    gridTemplateColumns: `repeat(auto-fill, minmax(25%, 1fr))`,
    gridAutoRows: '1fr',
  },
  sizingTile: {
    width: 0,
    paddingBottom: '100%',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
  },
  tile: {
    backgroundSize: 'cover',
    '&:nth-child(2)': {
      gridRow: '1 / 1',
      gridColumn: '1 / 1',
    },
  },
  title: {
    display: 'none',
  },
}));

export default function LibraryPage() {
  const { loading, error, data } = useLibrary();

  if (loading) return <span>loading...</span>;
  if (error) return <div>Error: {error.message}</div>;
  return <Library library={data} />;
}
