import Head from 'next/head';
import { connect } from 'react-redux';
import { Container, Alert, Button, ButtonGroup, Navbar, NavbarBrand } from 'reactstrap';
import { Notifs } from 'redux-notifications';

import { pressButton } from '../redux';
import FontAwesome from './FontAwesome';
import '../styles.scss';

function Layout({ children, dispatch }) {
  return (
    <React.Fragment>
      <Head>
        <title>Tabi-Disco</title>
        {process.env.NODE_ENV === 'production' && <link rel="stylesheet" href={`_next/static/style.css`} />}
        <script src="https://use.fontawesome.com/releases/v5.0.6/js/solid.js" crossOrigin="anonymous" />
        <script src="https://use.fontawesome.com/releases/v5.0.6/js/fontawesome.js" crossOrigin="anonymous" />
        <link rel="icon" type="image/x-icon"  href="/static/favicon.ico" />
      </Head>

      <Navbar color="primary" dark>
        <Container className="d-flex justify-content-between">
          <NavbarBrand href="/">
            <FontAwesome name="music" className="mr-2" />
            Tabi-Disco
          </NavbarBrand>
          <div className="ml-auto">
            <Button color="success" style={{ borderRadius: '50%' }} onClick={() => dispatch(pressButton('play'))}>
              <FontAwesome name="play" />
            </Button>
            <Button color="danger" style={{ borderRadius: '50%', marginLeft: '.5rem' }} onClick={() => dispatch(pressButton('stop'))}>
              <FontAwesome name="stop" />
            </Button>
          </div>
        </Container>
      </Navbar>

      {children}

      <Notifs CustomComponent={({ kind, message }) => <Alert color={kind === 'error' ? 'danger' : kind}>{message}</Alert>} />
    </React.Fragment>
  );
}

export default connect()(Layout);
