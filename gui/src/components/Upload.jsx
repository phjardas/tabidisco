import gql from 'graphql-tag';
import React from 'react';
import { Mutation } from 'react-apollo';
import { Button, Container, Form, FormGroup, Input, Alert } from 'reactstrap';
import { songDetails } from '../providers/data';
import { getSongsQuery } from './Library';

const addSongMutation = gql`
  mutation AddSong($tokenId: ID, $file: Upload!) {
    addSong(tokenId: $tokenId, file: $file) {
      success
      error
      song {
        ...SongDetails
      }
    }
  }

  ${songDetails}
`;

class Upload extends React.Component {
  state = { file: null };

  render() {
    const { addSong, loading, data, error } = this.props;
    const { file } = this.state;

    return (
      <Container className="mt-3">
        <Form
          onSubmit={e => {
            e.preventDefault();
            addSong({ file });
          }}
        >
          <p>Place a token on the reader and upload an MP3 file.</p>
          <FormGroup>
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
                  Token: {data.addSong.song.tokenId}
                  <br />
                  Filename: {data.addSong.song.filename}
                  <br />
                  Title: {data.addSong.song.title || <em>unknown</em>}
                  <br />
                  Artist: {data.addSong.song.artist || <em>unknown</em>}
                  <br />
                  Album: {data.addSong.song.album || <em>unknown</em>}
                </p>
              </Alert>
            )}
        </Form>
      </Container>
    );
  }
}

export default () => (
  <Mutation mutation={addSongMutation}>
    {(addSong, result) => (
      <Upload
        addSong={({ tokenId, file }) =>
          addSong({
            variables: { tokenId, file },
            update: (cache, result) => {
              const { songs } = cache.readQuery({ query: getSongsQuery });
              cache.writeQuery({
                query: getSongsQuery,
                data: { songs: [...songs, result.data.addSong.song] },
              });
            },
          })
        }
        {...result}
      />
    )}
  </Mutation>
);
