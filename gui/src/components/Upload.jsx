import React from 'react';
import { Alert, Button, Container, Form, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import { WithLibrary } from '../providers/Library';
import FontAwesome from './FontAwesome';

class Upload extends React.Component {
  state = {
    id: '',
    file: null,
    description: '',
  };

  render() {
    const { readTokenResult, addSong, addSongResult: { loading, error, data } } = this.props;
    const { id, file, description } = this.state;

    return (
      <Container className="mt-3">
        <Form
          onSubmit={e => {
            e.preventDefault();
            addSong({ id, file, description });
          }}
        >
          <p>Place a token on the reader and upload an MP3 file.</p>
          <FormGroup>
            <Label for="id">Token</Label>
            <InputGroup>
              <Input id="id" value={id} onChange={e => this.setState({ id: e.target.value })} />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={this.readToken} disabled={readTokenResult.loading}>
                  {readTokenResult.loading ? <FontAwesome icon="spinner" className="fa-pulse" /> : <FontAwesome icon="tag" />}
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="file">File</Label>
            <div className="custom-file">
              <Input
                type="file"
                id="file"
                accept=".mp3"
                required
                className="custom-file-input"
                disabled={loading}
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
          <FormGroup>
            <Label for="description">Description</Label>
            <Input id="description" value={description} onChange={e => this.setState({ description: e.target.value })} />
          </FormGroup>

          <Button type="submit" color="primary" disabled={loading || !file} className="mb-3">
            Upload song
          </Button>

          {loading && <Alert color="info">Uploading song&hellip;</Alert>}
          {error && (
            <Alert color="danger">
              <strong>Error uploading song:</strong> {error.message}
            </Alert>
          )}
          {data &&
            data.addSong &&
            data.addSong.error && (
              <Alert color="danger">
                <strong>Error uploading song:</strong> {data.addSong.error}
              </Alert>
            )}
          {data &&
            data.addSong &&
            data.addSong.success && (
              <Alert color="success">
                <p>
                  <strong>The new song was successfully added:</strong>
                </p>
                <p className="mb-0">
                  Token: {data.addSong.song.id}
                  <br />
                  Filename: {data.addSong.song.filename}
                  <br />
                  Title: {data.addSong.song.title || <em>unknown</em>}
                  <br />
                  Artist: {data.addSong.song.artist || <em>unknown</em>}
                  <br />
                  Album: {data.addSong.song.album || <em>unknown</em>}
                  <br />
                  Description: {data.addSong.song.description || <em>none</em>}
                </p>
              </Alert>
            )}
        </Form>
      </Container>
    );
  }

  readToken = async () => {
    const { readToken } = this.props;
    this.setState({ id: '' });
    const { data: { readToken: result } } = await readToken();

    if (result.success) {
      this.setState({ id: result.token });
    } else {
      alert(result.error);
    }
  };
}

export default () => (
  <WithLibrary>
    {({ readToken, readTokenResult, addSong, addSongResult }) => (
      <Upload readToken={readToken} readTokenResult={readTokenResult} addSong={addSong} addSongResult={addSongResult} />
    )}
  </WithLibrary>
);
