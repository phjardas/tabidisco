import React from 'react';
import { Button } from 'reactstrap';

import FontAwesome from './FontAwesome';

function getColor(power) {
  return power.state === 'on' || power.state === 'down' ? 'success' : 'danger';
}

function getTitle(power) {
  if (power.shutdownTimer) return 'Shutdown timer is active';
  switch (power.state) {
    case 'on':
      return 'Power is on';
    case 'off':
      return 'Power is off';
    case 'up':
      return 'Powering up...';
    case 'down':
      return 'Powering down...';
    default:
      return null;
  }
}

function getIcon(power) {
  if (power.shutdownTimer) return <FontAwesome key="timer" icon="clock" />;
  if (power.state === 'up' || power.state === 'down') return <FontAwesome key="transit" icon="spinner" className="fa-pulse" />;
  return <FontAwesome key="stable" icon="power-off" />;
}

export default function PowerState({ power, setPower, cancelShutdownTimer }) {
  if (!power) return null;

  const togglePower = () => {
    if (power.shutdownTimer) return cancelShutdownTimer();
    if (power.state === 'on') return setPower(false);
    if (power.state === 'off') return setPower(true);
  };

  return (
    <Button color={getColor(power)} title={getTitle(power)} style={{ borderRadius: '50%' }} onClick={togglePower}>
      {getIcon(power)}
    </Button>
  );
}
