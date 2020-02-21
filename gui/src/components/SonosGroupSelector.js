import { Button, CircularProgress, IconButton, Menu, MenuItem } from '@material-ui/core';
import { Help as HelpIcon } from '@material-ui/icons';
import React, { useCallback, useRef, useState } from 'react';
import { useSonos } from '../data';

export default function SonosGroupSelector(props) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), [setOpen]);
  const ref = useRef();
  const { loading, data, setSonosGroup } = useSonos();

  if (loading) return <CircularProgress color="inherit" />;
  if (!data) return null;

  const currentGroup = data.groups.find((g) => g.id === data.selectedGroup);

  return (
    <>
      <div ref={ref} {...props}>
        {currentGroup ? (
          <Button onClick={toggle}>{currentGroup.label}</Button>
        ) : (
          <IconButton onClick={toggle}>
            <HelpIcon />
          </IconButton>
        )}
      </div>
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
