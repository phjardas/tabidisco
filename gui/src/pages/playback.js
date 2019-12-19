import { Fab, LinearProgress, makeStyles, Paper, Typography } from '@material-ui/core';
import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import React, { useMemo } from 'react';
import Duration from '../components/Duration';
import { useLibrary } from '../data';

export default function Playback({ playback: { medium, elapsedSeconds, paused }, pause, resume, stop }) {
  const classes = useStyles();
  const { data } = useLibrary();
  const mediumData = useMemo(() => data && data.media.find((m) => m.id === medium.id), [data, medium]);

  return (
    <div className={classes.root} style={{ backgroundImage: mediumData && `url(${mediumData.image})` }}>
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
        {medium.duration && (
          <div className={classes.progress}>
            <LinearProgress variant="determinate" value={(elapsedSeconds / medium.duration) * 100} color="secondary" />
            <div className={classes.progressText}>
              <DurationInfo seconds={elapsedSeconds} />
              <DurationInfo seconds={medium.duration - elapsedSeconds} />
              <DurationInfo seconds={medium.duration} />
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
}

function DurationInfo({ seconds, ...rest }) {
  return (
    <Typography variant="caption" {...rest}>
      <Duration seconds={seconds} />
    </Typography>
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
  },
  controls: {
    position: 'absolute',
    bottom: spacing(4),
    left: spacing(4),
    right: spacing(4),
    padding: spacing(2),
    textAlign: 'center',
  },
  buttons: {
    margin: `${spacing(2)}px ${spacing(4)}px ${spacing(2)}px`,
  },
  stopButton: {
    marginLeft: spacing(4),
  },
  progress: {
    marginTop: spacing(4),
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: spacing(1),
  },
}));
