import React from 'react';
import { Card, CardBody } from 'reactstrap';

import UploadSongForm from './UploadSongForm';
import AnimatedModal from './AnimatedModal';
import FontAwesome from './FontAwesome';

export default class UploadSong extends React.Component {
  render() {
    const { songUpload, uploadSong } = this.props;

    return (
      <Card className="mt-3">
        <CardBody>
          <h3>Upload a Song</h3>
          <UploadSongForm uploadSong={uploadSong} />
          {songUpload &&
            songUpload.pending && (
              <AnimatedModal particle={props => <FontAwesome name="music" {...props} />} particleCount={100}>
                Uploading song&hellip;
              </AnimatedModal>
            )}
        </CardBody>
      </Card>
    );
  }
}
