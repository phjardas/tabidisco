import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { Field, Form, Formik, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useCallback } from 'react';
import { mixed, object, string } from 'yup';

const initialValues = {
  title: 'Der kleine Drache Kokosnuss im Weltraum',
  file: '',
  image: '',
};

const schema = object().shape({
  title: string().required('Please enter a title'),
  file: mixed().required('Please select an audio file'),
  image: mixed().required('Please select a cover image'),
});

export default function CreateMediumModal({ open, createMedium, handleClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const onSubmit = async (data, actions) => {
    try {
      const result = await createMedium(data);
      if (!result.success) {
        console.error('Error uploading medium:', result);
        actions.setStatus(result);
      } else {
        handleClose();
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
      <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
        {({ isValid, dirty, isSubmitting }) => (
          <Form>
            <DialogTitle>Create medium</DialogTitle>
            <DialogContent>
              <CreateMediumForm />
            </DialogContent>
            <DialogActions>
              <Button type="reset" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={!dirty || !isValid || isSubmitting}>
                Create medium
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

function CreateMediumForm() {
  const classes = useStyles();
  const { errors, setFieldValue } = useFormikContext();
  const onFileDrop = useCallback((files) => setFieldValue('file', files.length ? files[0] : ''), [setFieldValue]);
  const onImageDrop = useCallback((files) => setFieldValue('image', files.length ? files[0] : ''), [setFieldValue]);

  return (
    <>
      <Field name="title" label="Title" component={TextField} margin="normal" required fullWidth />
      <FormControl margin="normal" fullWidth hiddenLabel required error={!!errors.file}>
        <InputLabel>Audio file</InputLabel>
        <DropzoneArea
          acceptedFiles={['audio/mp3']}
          filesLimit={1}
          maxFileSize={1024 * 1024 * 1024}
          showPreviewsInDropzone={false}
          dropzoneText="Drag and drop an audio file here or click to select one"
          dropzoneClass={classes.dropzone}
          dropzoneParagraphClass={classes.dropzoneBody}
          onChange={onFileDrop}
        />
        {errors.file && <FormHelperText>{errors.file}</FormHelperText>}
      </FormControl>
      <FormControl margin="normal" fullWidth hiddenLabel required error={!!errors.image}>
        <InputLabel>Cover image</InputLabel>
        <DropzoneArea
          acceptedFiles={['image/*']}
          filesLimit={1}
          maxFileSize={1024 * 1024}
          dropzoneText="Drag and drop a cover image here or click to select one"
          dropzoneClass={classes.dropzone}
          dropzoneParagraphClass={classes.dropzoneBody}
          onChange={onImageDrop}
        />
        {errors.image && <FormHelperText>{errors.image}</FormHelperText>}
      </FormControl>
    </>
  );
}

const useStyles = makeStyles(({ spacing, typography }) => ({
  dropzone: {
    padding: spacing(2),
    minHeight: 100,
  },
  dropzoneBody: {
    ...typography.body1,
  },
}));
