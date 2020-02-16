import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { Field, Form, Formik, useField, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useCallback, useState, useEffect } from 'react';
import { mixed, object, string } from 'yup';
import { readMp3Tags } from '../../data/mp3';

const initialValues = {
  title: '',
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
    const result = await createMedium(data);
    if (!result.success) {
      console.error('Error uploading medium:', result);
      actions.setStatus(result);
      actions.setSubmitting(false);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
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
  const { values } = useFormikContext();

  return (
    <>
      {values.file ? (
        <>
          <span>{values.file.name}</span>
          <Field name="title" label="Title" component={TextField} margin="normal" required fullWidth color="secondary" />
          <ImageField />
        </>
      ) : (
        <FileField />
      )}
    </>
  );
}

function FileField() {
  const [input, meta] = useField('file');
  const { setFieldValue } = useFormikContext();

  const onChange = useCallback(
    async (e) => {
      const { files, name } = e.target;
      if (files.length) {
        const file = files[0];
        const tags = await readMp3Tags(file);
        setFieldValue(name, file);

        if (tags.common.title) {
          setFieldValue('title', tags.common.title);
        }

        if (tags.common.picture && tags.common.picture.length) {
          const picture = tags.common.picture[0];
          setFieldValue('image', new File([picture.data], 'picture', { type: picture.format }));
        }
      } else {
        setFieldValue(name, null);
      }
    },
    [setFieldValue]
  );

  return (
    <FormControl margin="normal" fullWidth required error={!!meta.error}>
      <label htmlFor="createMedium-file">
        <Button variant="contained" type="button" color="secondary" component="span">
          choose audio file
        </Button>
      </label>
      <input id="createMedium-file" type="file" accept="audio/mp3" style={{ display: 'none' }} name={input.name} onChange={onChange} onBlur={input.onBlur} />
      {meta.error && <FormHelperText>{meta.error}</FormHelperText>}
    </FormControl>
  );
}

function ImageField() {
  const classes = useStyles();
  const [input, meta] = useField('image');
  const { setFieldValue } = useFormikContext();
  const [preview, setPreview] = useState();

  const onChange = useCallback(
    async (e) => {
      const { files, name } = e.target;
      setFieldValue(name, files.length ? files[0] : null);
    },
    [setFieldValue]
  );

  useEffect(() => {
    if (input.value) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(input.value);
    } else {
      setPreview(null);
    }
  }, [input.value, setPreview]);

  return (
    <>
      <FormControl
        margin="normal"
        fullWidth
        required
        error={!!meta.error}
        className={preview ? classes.imagePreview : ''}
        style={{ backgroundImage: preview ? `url(${preview})` : null }}
      >
        <label htmlFor="createMedium-image" className={preview ? classes.imagePreviewButton : ''}>
          <Button variant="contained" type="button" color="secondary" component="span">
            choose cover image
          </Button>
        </label>
        <input id="createMedium-image" type="file" accept="image/*" style={{ display: 'none' }} name={input.name} onChange={onChange} onBlur={input.onBlur} />
        {meta.error && <FormHelperText>{meta.error}</FormHelperText>}
      </FormControl>
    </>
  );
}

const useStyles = makeStyles(({ spacing, typography }) => ({
  imagePreview: {
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    minHeight: 300,
    position: 'relative',
  },
  imagePreviewButton: {
    position: 'absolute',
    bottom: spacing(1),
    right: spacing(1),
  },
}));
