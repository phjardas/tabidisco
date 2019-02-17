import React, { useState } from 'react';
import { Alert, Button, Container, Form, FormGroup, FormText, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import { useLibrary } from '../providers/Library';
import FontAwesome from './FontAwesome';

const endpoint = (process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql') + '/..';

export default () => {
  const { readToken, readTokenResult } = useLibrary();
  const [id, setId] = useState('');
  const [tokenError, setTokenError] = useState();
  const [file, setFile] = useState();
  const [description, setDescription] = useState('');
  const [{ loading, error, data }, setState] = useState({});

  const doReadToken = async () => {
    setId('');
    setTokenError(null);
    const { data: { readToken: result } } = await readToken();

    if (result.success) {
      setId(result.token);
      return result.token;
    } else {
      setTokenError(result.error);
    }
  };

  const doAddSong = async () => {
    setState({ loading: true });

    try {
      const id = await doReadToken();
      if (!id || !file) {
        setState({ loading: false });
        return;
      }

      const form = new FormData();
      form.append('description', description);
      form.append('file', file);

      const response = await fetch(`${endpoint}/songs/${id}`, {
        method: 'PUT',
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Error uploading song: (${response.status}) ${response.statusText}`);
      }

      setState({ loading: false, data: await response.json() });
    } catch (error) {
      setState({ loading: false, error });
    }
  };

  return (
    <Container className="mt-3">
      <Form
        onSubmit={e => {
          e.preventDefault();
          doAddSong({ id, file, description });
        }}
      >
        <p>Place a token on the reader and upload an MP3 file.</p>
        <FormGroup>
          <Label for="id">Token</Label>
          <InputGroup>
            <Input id="id" value={id} onChange={e => setId(e.target.value)} />
            <InputGroupAddon addonType="append">
              <Button color="secondary" onClick={doReadToken} disabled={readTokenResult.loading}>
                {readTokenResult.loading ? <FontAwesome icon="spinner" className="fa-pulse" /> : <FontAwesome icon="tag" />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          {tokenError && <FormText color="danger">{tokenError}</FormText>}
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
              onChange={e => setFile(e.target.files[0])}
            />
            <label className="custom-file-label" htmlFor="file">
              {file ? file.name : 'Choose file'}
            </label>
          </div>
        </FormGroup>
        <FormGroup>
          <Label for="description">Description</Label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
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
        {data && (
          <Alert color="success">
            <p>
              <strong>The new song was successfully added:</strong>
            </p>
            <p className="mb-0">
              Token: {data.id}
              <br />
              Filename: {data.filename}
              <br />
              Title: {data.title || <em>unknown</em>}
              <br />
              Artist: {data.artist || <em>unknown</em>}
              <br />
              Album: {data.album || <em>unknown</em>}
              <br />
              Description: {data.description || <em>none</em>}
            </p>
          </Alert>
        )}
      </Form>
    </Container>
  );
};
