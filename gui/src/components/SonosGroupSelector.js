import { Button, CircularProgress, makeStyles, Menu, MenuItem } from '@material-ui/core';
import { SpeakerGroup as GroupIcon } from '@material-ui/icons';
import React, { useCallback, useRef, useState } from 'react';
import { useSonos } from '../data';

const useStyles = makeStyles(({ spacing }) => ({
  iconButton: {
    marginRight: spacing(1),
  },
}));

export default function SonosGroupSelector(props) {
  const { loading, data, setSonosGroup } = useSonos();
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), [setOpen]);
  const ref = useRef();
  const classes = useStyles();

  if (loading) return <CircularProgress color="inherit" />;
  if (!data) return null;

  const currentGroup = data.groups.find((g) => g.id === data.selectedGroup);

  return (
    <>
      <Button {...props} ref={ref} onClick={toggle}>
        <GroupIcon className={classes.iconButton} /> {currentGroup ? currentGroup.label : 'No group selected'}
      </Button>
      {ref.current && (
        <Menu anchorEl={ref.current} keepMounted open={open} onClose={toggle}>
          {data.groups.map((g) => (
            <MenuItem
              key={g.id}
              disabled={g.id === data.selectedGroup}
              onClick={() => {
                setSonosGroup(g.id);
                toggle();
              }}
            >
              {g.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}
