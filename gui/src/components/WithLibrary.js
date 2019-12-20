import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { useLibrary } from '../data';

export default function WithLibrary({ children }) {
  const { loading, error, data, ...rest } = useLibrary();
  if (loading) return <CircularProgress color="secondary" />;
  if (error) return <div>Error: {error.message}</div>;
  return children({ library: data, ...rest });
}
