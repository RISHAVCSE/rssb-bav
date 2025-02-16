import * as React from 'react';
import Button from '@mui/material/Button';
import { forwardRef, useImperativeHandle, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Formik, Form, Field, FormikHelpers, ErrorMessage } from 'formik';
import Paper, { PaperProps } from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { Box, TextField } from '@mui/material';
import * as Yup from 'yup';
import { Height, Padding } from '@mui/icons-material';

interface Values {
  mmsId: number;
  bookName: string;
  quantity: number;
  amount: number;
}

type Book = {
  mmsId?: number;
  bookName?: string;
  quantity?: number;
  amount?: number;
};

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const AddBook = forwardRef((props: { onBookSubmit: (book: Book) => void }, ref) => {
  const initialValue: Book = {};


  const [open, setOpen] = useState(false);

  // Function to open the dialog, exposed to the parent
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const SelectFieldStyle = {
    Height: '1em'
};
 

  const handleSubmit = (values: Book, formikHelpers: FormikHelpers<Book>) => {
    props.onBookSubmit(values);
    console.log(values);
    formikHelpers.resetForm(); // Reset the form after submission
    handleClose(); 
    // Close the dialog after submitting
  };
  const validationSchema= Yup.object().shape(
    {
      mmsId: Yup.number().min(2,'Value must be greater than 2').required('Field is required'),
      bookName: Yup.string().min(2,'Value must be greater than 2').required('Field is required'),
      quantity: Yup.number().min(2,'Value must be greater than 2').required('Field is required'),
      amount:  Yup.number().min(2,'Value must be greater than 2').required('Field is required'),
      
    }
  )

  // Expose the openDialog function to the parent using ref
  useImperativeHandle(ref, () => ({
    openDialog: handleClickOpen,
  }));

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
         <DialogTitle style={{ cursor: 'move',marginBottom: '3px',color:'white',background: 'rgb(25 118 210)',borderRadius: '5px' }} id="draggable-dialog-title">
          Add Book
        </DialogTitle>
       
        <DialogContent style={{padding:0}}>
          <Paper>
         
            <Box p={3} style={{paddingTop: 0}}>
            <Formik
  initialValues={initialValue}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}  // Formik will handle submission
  validateOnBlur={true}
  validateOnChange={true}
  validateOnSubmit={true}
>
  {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => {
    const { mmsId, bookName, quantity, amount } = values;

    return (
      <Form>  {/* No need to add onSubmit here */}
        <TextField
          label="MMS ID"
          name="mmsId"
          fullWidth
          value={mmsId}
          variant="outlined"
          margin="dense"
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(errors.mmsId)}
          helperText={errors.mmsId}
          sx={{
            '& .MuiOutlinedInput-input': {
              height: '1em',
            },
          }}
        />

        <TextField
          label="Book Name"
          name="bookName"
          value={bookName}
          fullWidth
          variant="outlined"
          margin="dense"
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(errors.bookName)}
          helperText={errors.bookName}
          sx={{
            '& .MuiOutlinedInput-input': {
              height: '1em',
            },
          }}
        />

        <TextField
          label="Quantity"
          name="quantity"
          fullWidth
          value={quantity}
          variant="outlined"
          margin="dense"
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(errors.quantity)}
          helperText={errors.quantity}
          sx={{
            '& .MuiOutlinedInput-input': {
              height: '1em',
            },
          }}
        />

        <TextField
          label="Amount"
          name="amount"
          fullWidth
          value={amount}
          variant="outlined"
          margin="dense"
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(errors.amount)}
          helperText={errors.amount}
          sx={{
            '& .MuiOutlinedInput-input': {
              height: '1em',
            },
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            style={{ width: '160px', height: '45px' }}
            disabled={isSubmitting}  // Optionally disable the button while submitting
          >
            Submit
          </Button>
          <Button
            variant="contained"
            color="primary"
            style={{ width: '160px', height: '45px' }}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </Form>
    );
  }}
</Formik>

            </Box>
          </Paper>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
});

export default AddBook;
