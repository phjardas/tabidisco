import { Fab, makeStyles, Paper } from '@material-ui/core';
import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import React, { useMemo } from 'react';
import { serverBaseUrl } from '../config';
import { useLibrary } from '../data';

export default function Playback({ playback: { medium, paused }, pause, resume, stop }) {
  const classes = useStyles();
  const { data } = useLibrary();
  const mediumData = useMemo(() => data && data.media.find((m) => m.id === medium.id), [data, medium]);

  return (
    <div className={classes.root} style={{ backgroundImage: mediumData && `url(${serverBaseUrl}/media/${medium.id}/cover)` }}>
      <Paper className={classes.controls}>
        <div className={classes.buttons}>
          {paused ? (
            <Fab color="secondary" onClick={resume}>
              <PlayIcon />
            </Fab>
          ) : (
            <Fab color="secondary" onClick={pause}>
              <PauseIcon />
            </Fab>
          )}
          <Fab color="primary" className={classes.stopButton} onClick={stop}>
            <StopIcon />
          </Fab>
        </div>
        <div>{medium.title}</div>
      </Paper>
    </div>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  },
  controls: {
    position: 'absolute',
    bottom: spacing(4),
    left: '50%',
    transform: 'translateX(-50%)',
    padding: spacing(4),
    textAlign: 'center',
  },
  buttons: {
    margin: `0 ${spacing(4)}px ${spacing(2)}px`,
  },
  stopButton: {
    marginLeft: spacing(4),
  },
}));
