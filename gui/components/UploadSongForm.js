import React from 'react';
import { Button, Form, FormGroup, Input, Row, Col } from 'reactstrap';

export default class UploadSongForm extends React.Component {
  state = { file: null };

  render() {
    const { uploadSong } = this.props;
    const { file } = this.state;

    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
          uploadSong(file);
        }}
      >
        <p>Place a token on the reader and upload an MP3 file.</p>
        <FormGroup>
          <div className="custom-file">
            <Input
              type="file"
              id="file"
              required
              className="custom-file-input"
              onChange={e =>
                this.setState({
                  file: e.target.files[0],
                })
              }
            />
            <label className="custom-file-label" htmlFor="file">
              {file ? file.name : 'Choose file'}
            </label>
          </div>
        </FormGroup>

        <Button type="submit" color="primary" disabled={!file} className="mt-lg-2">
          Upload song
        </Button>
      </Form>
    );
  }
}
