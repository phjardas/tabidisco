import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLibrary, usePlayback } from '../data';
import { makeStyles } from '@material-ui/core/styles';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PauseIcon from '@material-ui/icons/Pause';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import bindKeyboard from 'react-swipeable-views-utils/lib/bindKeyboard';
import SwipeableViews from 'react-swipeable-views';
import virtualize from 'react-swipeable-views-utils/lib/virtualize';

function Main({ library }) {
  const classes = useStyles();
  const { playback } = usePlayback();
  const media = useMemo(() => [...library.media].sort((a, b) => a.title.localeCompare(b.title)), [library.media]);
  const [index, setIndex] = useState(0);

  const updateIndex = useCallback(
    (i) => {
      if (!playback) setIndex(i);
    },
    [playback]
  );

  useEffect(() => {
    if (playback) setIndex(media.findIndex((m) => m.id === playback.medium.id));
  }, [playback, media, setIndex]);

  return (
    <div className={classes.root}>
      <Carousel index={index} onChangeIndex={updateIndex} className={classes.carousel} containerStyle={{ height: '100%' }}>
        {media.map((medium) => (
          <div key={medium.id} className={classes.slide} style={{ backgroundImage: medium.image && `url(${medium.image})` }} />
        ))}
      </Carousel>
      {playback ? (
        <PlaybackControls playback={playback} className={classes.controls} />
      ) : (
        <>
          <Fab color="primary" className={classes.previousButton} onClick={() => setIndex((i) => i - 1)}>
            <SkipPreviousIcon />
          </Fab>
          <Fab color="primary" className={classes.nextButton} onClick={() => setIndex((i) => i + 1)}>
            <SkipNextIcon />
          </Fab>
        </>
      )}
    </div>
  );
}

const VirtualizeSwipeViews = virtualize(bindKeyboard(SwipeableViews));

const modulo = (a, n) => ((a % n) + n) % n;

const carouselSlideRenderer = (children) => ({ index, key }) => React.cloneElement(children[modulo(index, children.length)], { key });

function Carousel({ children, ...rest }) {
  return <VirtualizeSwipeViews slideRenderer={carouselSlideRenderer(children)} {...rest} />;
}

function PlaybackControls({ playback, className }) {
  const classes = useStyles();
  return (
    <Paper className={className}>
      <Fab color="primary" className={classes.playPauseButton}>
        <PauseIcon />
      </Fab>
      <LinearProgress variant="determinate" value={(playback.elapsedSeconds / playback.medium.duration) * 100} color="secondary" />
    </Paper>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  carousel: {
    width: '100%',
    height: '100%',
  },
  slide: {
    backgroundColor: 'green',
    backgroundSize: 'cover',
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: '40%',
    right: '40%',
    padding: spacing(2),
    textAlign: 'center',
  },
  playPauseButton: {
    fontSize: '2rem',
    marginBottom: spacing(2),
  },
  previousButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    padding: 0,
  },
  nextButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    padding: 0,
  },
}));

export default function MainPage() {
  const { loading, error, data } = useLibrary();

  if (loading) return <span>loading...</span>;
  if (error) return <div>Error: {error.message}</div>;
  return <Main library={data} />;
}
