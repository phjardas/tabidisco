import React from 'react';
import { Card, CardBody } from 'reactstrap';

import UploadSongForm from './UploadSongForm';

export default class UploadSong extends React.Component {
  state = { uploading: false };

  render() {
    const { uploadSong } = this.props;

    return (
      <Card className="mt-3">
        <CardBody>
          <h3>Upload a Song</h3>
          <UploadSongForm uploadSong={uploadSong} />
        </CardBody>
      </Card>
    );
  }
}
