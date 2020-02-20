import { CircularProgress, MenuItem, Select } from '@material-ui/core';
import React, { useCallback } from 'react';
import { useSonos } from '../data';

export default function SonosGroupSelector(props) {
  const { loading, data, setSonosGroup } = useSonos();
  const updateSonosGroup = useCallback((e) => setSonosGroup(e.target.value), [setSonosGroup]);

  if (loading) return <CircularProgress color="inherit" />;
  if (!data) return null;

  return (
    <Select {...props} value={data.selectedGroup} onChange={updateSonosGroup}>
      {data.groups.map((g) => (
        <MenuItem key={g.id} value={g.id}>
          {g.label}
        </MenuItem>
      ))}
    </Select>
  );
}
