import { Button, Card, CardActions, CardContent, Fab, IconButton, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { useState } from 'react';
import Container from '../../components/Container';
import Duration from '../../components/Duration';
import MediaGrid from '../../components/MediaGrid';
import WithLibrary from '../../components/WithLibrary';
import CreateMediumModal from './CreateMediumModal';

function Library({ library, createMedium, deleteMedium }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const classes = useStyles();

  return (
    <>
      {library.media.length > 0 ? (
        <>
          <MediaGrid
            media={library.media}
            createActionIcon={(medium) => (
              <IconButton className={classes.actionIcon} onClick={() => deleteMedium(medium.id)}>
                <DeleteIcon />
              </IconButton>
            )}
            className={classes.grid}
          />
          <Card>
            <CardContent>
              {library.media.length} items with a total play time of <Duration seconds={library.media.map((m) => m.duration || 0).reduce((a, b) => a + b, 0)} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent>No media yet.</CardContent>
          <CardActions>
            <Button variant="contained" color="secondary" onClick={() => setCreateModalOpen(true)}>
              Upload your first medium
            </Button>
          </CardActions>
        </Card>
      )}
      <Fab color="secondary" className={classes.fab} onClick={() => setCreateModalOpen(true)}>
        <AddIcon />
      </Fab>
      {createModalOpen && <CreateMediumModal open={createModalOpen} createMedium={createMedium} handleClose={() => setCreateModalOpen(false)} />}
    </>
  );
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  grid: { marginBottom: spacing(2) },
  fab: {
    position: 'fixed',
    bottom: spacing(2),
    right: spacing(2),
  },
  actionIcon: {
    color: palette.text.secondary,
  },
}));

export default function LibraryPage() {
  return (
    <Container>
      <WithLibrary>{(data) => <Library {...data} />}</WithLibrary>
    </Container>
  );
}
