import React from 'react';
import { Button } from 'reactstrap';
import FontAwesome from './FontAwesome';
import PowerState from './PowerState';

export default function Buttons({ power, setPower, cancelShutdownTimer, pressButton }) {
  return (
    <>
      <PowerState power={power} setPower={setPower} cancelShutdownTimer={cancelShutdownTimer} />
      <Button
        color="success"
        title="Press PLAY button"
        style={{ borderRadius: '50%' }}
        onClick={() => pressButton('play')}
        className="ml-2"
      >
        <FontAwesome icon="play" />
      </Button>
      <Button color="danger" title="Press STOP button" style={{ borderRadius: '50%' }} onClick={() => pressButton('stop')} className="ml-2">
        <FontAwesome icon="stop" />
      </Button>
    </>
  );
}
