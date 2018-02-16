import React from 'react';
import { Alert } from 'reactstrap';

export default function ConnectionState({ state }) {
  const style = { borderRadius: 0 };

  switch (state) {
    case 'disconnected':
      return (
        <Alert color="danger" style={style}>
          Disconnected!
        </Alert>
      );
    case 'connecting':
      return (
        <Alert color="info" style={style}>
          Connecting...
        </Alert>
      );
    case 'reconnecting':
      return (
        <Alert color="warning" style={style}>
          Reconnecting...
        </Alert>
      );
    default:
      return null;
  }
}
