import Fab from '@material-ui/core/Fab';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import React, { useMemo } from 'react';
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
        <div className={classes.progress}>
          <LinearProgress variant="determinate" value={(elapsedSeconds / medium.duration) * 100} color="secondary" />
          <div className={classes.progressText}>
            <Duration seconds={elapsedSeconds} />
            <Duration seconds={medium.duration - elapsedSeconds} />
            <Duration seconds={medium.duration} />
          </div>
        </div>
      </Paper>
    </div>
  );
}

function Duration({ seconds, ...rest }) {
  let remaining = seconds;
  const hours = Math.floor(remaining / 3600);
  remaining = remaining - hours * 3600;
  const minutes = Math.floor(remaining / 60);
  remaining = remaining - minutes * 60;

  return (
    <Typography variant="caption" {...rest}>
      {[hours && hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), remaining.toString().padStart(2, '0')].filter((s) => !!s).join(':')}
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
    bottom: 20,
    left: '40%',
    right: '40%',
    padding: spacing(2),
    textAlign: 'center',
  },
  buttons: {
    margin: `${spacing(2)}px ${spacing(4)}px ${spacing(4)}px`,
  },
  stopButton: {
    marginLeft: spacing(4),
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: spacing(1),
  },
}));
