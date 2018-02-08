import React from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';

export default class UploadSongForm extends React.Component {
  state = { tokenId: '', file: null };

  render() {
    const { uploadSong } = this.props;

    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
          uploadSong({ tokenId: this.state.tokenId, file: this.state.file });
        }}
      >
        <Row>
          <Col xs={12} md={6} lg={5}>
            <FormGroup>
              <Label for="tokenId">Token ID</Label>
              <Input id="tokenId" required onChange={e => this.setState({ tokenId: e.target.value })} />
            </FormGroup>
          </Col>
          <Col xs={12} md={5}>
            <FormGroup>
              <Label for="file">File</Label>
              <div className="custom-file">
                <Input
                  type="file"
                  id="file"
                  required
                  className="custom-file-input"
                  onChange={e => this.setState({ file: e.target.files[0] })}
                />
                <label className="custom-file-label" htmlFor="file">
                  Choose file
                </label>
              </div>
            </FormGroup>
          </Col>
          <Col xs={12} lg={2} className="pt-lg-4">
            <Button type="submit" color="primary" className="mt-lg-2">
              Upload song
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
