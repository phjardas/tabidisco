import * as React from 'react';
import { Container } from 'reactstrap';

function Info({ info }) {
  if (info.pending) return <span>loading&hellip;</span>;
  if (info.error) return <span>Error fetching info: {info.error.message}</span>;
  return (
    <React.Fragment>
      <span>v{info.version}</span>
      <a href={`https://github.com/phjardas/tabidisco/commit/${info.buildInfo.commit}`} rel="noreferrer" className="ml-1">
        commit {info.buildInfo.commit}
      </a>
    </React.Fragment>
  );
}

export default function Footer({ info }) {
  return (
    <footer className="footer bg-dark text-light mt-4 py-2">
      <Container className="d-flex justify-content-between" style={{ fontSize: '.8rem' }}>
        <span>
          <strong className="mr-2">Tabidisco</strong>
          <Info info={info} />
        </span>
        <span>
          by Philipp Jardas
          {' – '}
          <a href="https://github.com/phjardas/tabidisco" rel="noreferrer">
            GitHub
          </a>
        </span>
      </Container>
    </footer>
  );
}
