import React from 'react';
import { Button } from 'reactstrap';

import FontAwesome from './FontAwesome';

function getColor(power) {
  return power.state === 'on' || power.state === 'powering_down' ? 'success' : 'danger';
}

function getTitle(power) {
  if (power.shutdownTimer) return 'Shutdown timer is active';
  switch (power.state) {
    case 'on':
      return 'Power is on';
    case 'off':
      return 'Power is off';
    case 'powering_up':
      return 'Powering up...';
    case 'powering_down':
      return 'Powering down...';
    default:
      return null;
  }
}

function getIcon(power) {
  if (power.shutdownTimer) return <FontAwesome key="timer" name="clock" />;
  if (power.state === 'powering_up' || power.state === 'powering_down')
    return <FontAwesome key="transit" name="spinner" className="fa-pulse" />;
  return <FontAwesome key="stable" name="power-off" />;
}

export default function ConnectionState({ power, setPower, cancelShutdownTimer }) {
  const togglePower = () => {
    if (power.state === 'on') return setPower(false);
    if (power.state === 'off') return setPower(true);
    if (power.shutdownTimer) return cancelShutdownTimer();
  };

  return (
    <Button color={getColor(power)} title={getTitle(power)} style={{ borderRadius: '50%' }} onClick={togglePower}>
      {getIcon(power)}
    </Button>
  );
}
