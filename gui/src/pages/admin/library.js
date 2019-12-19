import Duration from '../../components/Duration';
import {
  CircularProgress,
  Fab,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  makeStyles,
  useMediaQuery,
  useTheme,
  Button,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { useState } from 'react';
import { useLibrary } from '../../data';
import CreateMediumModal from './CreateMediumModal';

function Library({ library, createMedium, deleteMedium }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const classes = useStyles();
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down('xs'));
  const sm = useMediaQuery(theme.breakpoints.down('sm'));
  const md = useMediaQuery(theme.breakpoints.down('md'));
  const cols = xs ? 1 : sm ? 2 : md ? 3 : 4;

  return (
    <>
      {library.media.length > 0 ? (
        <>
          <GridList cols={cols} cellHeight={300}>
            {[...library.media]
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((medium) => (
                <GridListTile key={medium.id}>
                  <img src={medium.image} alt={medium.title} />
                  <GridListTileBar
                    title={medium.title}
                    subtitle={medium.duration && <Duration seconds={medium.duration} />}
                    actionIcon={
                      <IconButton className={classes.actionIcon} onClick={() => deleteMedium(medium.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  />
                </GridListTile>
              ))}
          </GridList>
          <Typography variant="body2">
            {library.media.length} items with a total play time of <Duration seconds={library.media.map((m) => m.duration || 0).reduce((a, b) => a + b, 0)} />
          </Typography>
        </>
      ) : (
        <>
          <Typography gutterBottom>No media yet.</Typography>
          <Button variant="contained" color="secondary" onClick={() => setCreateModalOpen(true)}>
            Upload your first medium
          </Button>
        </>
      )}
      <Fab color="secondary" className={classes.fab} onClick={() => setCreateModalOpen(true)}>
        <AddIcon />
      </Fab>
      {createModalOpen && <CreateMediumModal open={createModalOpen} createMedium={createMedium} handleClose={() => setCreateModalOpen(false)} />}
    </>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  fab: {
    position: 'absolute',
    bottom: spacing(2),
    right: spacing(2),
  },
  actionIcon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
}));

export default function LibraryPage() {
  const { loading, error, data, createMedium, deleteMedium } = useLibrary();
  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;
  return <Library library={data} createMedium={createMedium} deleteMedium={deleteMedium} />;
}
