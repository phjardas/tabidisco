import { Button, GridListTileBar, makeStyles, Paper } from '@material-ui/core';
import React, { useCallback, useMemo } from 'react';
import Duration from '../components/Duration';

export default function MediaGrid({ media, onClick, createActionIcon, className }) {
  const classes = useStyles();
  const sortedMedia = useMemo(() => [...media].sort((a, b) => a.title.localeCompare(b.title)), [media]);
  const handleClick = useCallback((medium) => onClick && (() => onClick(medium)), [onClick]);

  return (
    <div className={`${classes.grid} ${className || ''}`}>
      <div className={classes.sizingTile} />
      {sortedMedia.map((medium) => (
        <MediumTile key={medium.id} medium={medium} onClick={handleClick(medium)} createActionIcon={createActionIcon} />
      ))}
    </div>
  );
}

function MediumTile({ medium, onClick, createActionIcon }) {
  const classes = useStyles();
  const actionIcon = useMemo(() => createActionIcon && createActionIcon(medium), [createActionIcon, medium]);
  const Tile = onClick ? Button : Paper;

  return (
    <Tile className={classes.tile} style={{ backgroundImage: `url(${medium.image})` }} onClick={onClick}>
      <GridListTileBar
        title={medium.title}
        subtitle={
          medium.duration && (
            <>
              <Duration seconds={medium.duration} />
              {medium.playCount && `, ${medium.playCount} play${medium.playCount > 1 ? 's' : ''}`}
            </>
          )
        }
        actionIcon={actionIcon}
        className={classes.title}
      />
    </Tile>
  );
}

const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  grid: {
    display: 'grid',
    gap: `${spacing(2)}px`,
    gridAutoRows: '1fr',
    [breakpoints.up('sm')]: {
      gridTemplateColumns: `repeat(auto-fill, minmax(45%, 1fr))`,
    },
    [breakpoints.up('md')]: {
      gridTemplateColumns: `repeat(auto-fill, minmax(30%, 1fr))`,
    },
    [breakpoints.up('lg')]: {
      gridTemplateColumns: `repeat(auto-fill, minmax(17%, 1fr))`,
    },
  },
  sizingTile: {
    width: 0,
    paddingBottom: '100%',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
  },
  tile: {
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    '&:nth-child(2)': {
      gridRow: '1 / 1',
      gridColumn: '1 / 1',
    },
  },
  title: {
    textTransform: 'none',
    fontWeight: 'normal',
    textAlign: 'left',
  },
}));
