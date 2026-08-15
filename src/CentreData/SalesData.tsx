import { Cancel } from "@mui/icons-material";
import { Autocomplete, Button, Dialog, Grid, IconButton, Paper, Slide, TextField, Typography } from "@mui/material";
import { Field, FieldArray, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { TransitionProps } from "@mui/material/transitions";

interface ChildProps {
  items: Books[];
  openState: boolean;
}

interface Books {
  mmsId: number;
  bookName: string;
  quantity: number;
  amount: number;
  maxQuantity: number;
}

interface FormValues {
  books: Books[];
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SalesData: React.FC<any> = ({ items, openState,onClose, onDataSubmit }) => {
  const [availableBooks, setAvailableBooks] = useState<Books[]>(items);
  const [selectedBooks, setSelectedBooks] = useState<Books | null>(null);
  const [closeDialog, setCloseDialog]=useState(false);

  const handleClose = () => {
    // Handle dialog close logic here
    setCloseDialog(true);
  };

  useEffect(() => {
    setAvailableBooks(items);
  }, [items]);

  const handleSubmit = (values: FormValues, {resetForm}: {resetForm: ()=> void}) => {
    console.log("Form Submitted", values);
    onDataSubmit(values);

    resetForm();
    setSelectedBooks(null);
setAvailableBooks(items);

    // Handle form submission logic here
  };

  const handleAddBook = (values: FormValues, setFieldValue: any) => {
    if (selectedBooks) {
      const newBook = { ...selectedBooks, quantity: 1, maxQuantity: selectedBooks.quantity };
      setFieldValue("books", [...values.books, newBook]);
      setAvailableBooks(availableBooks.filter((book) => book.mmsId !== selectedBooks.mmsId));
      setSelectedBooks(null);
    }
  };

  const handleRemoveBook = (index: number, values: FormValues, setFieldValue: any) => {
    const removedBook = values.books[index];
    const updatedBooks = values.books.filter((_, i) => i !== index);
    setFieldValue("books", updatedBooks);
    setAvailableBooks([...availableBooks, removedBook]);
  };

  return (
    <Dialog fullScreen open={openState} onClose={handleClose} TransitionComponent={Transition}>
      <Paper style={{ margin: '2%' }}>
        <Formik<FormValues>
          initialValues={{ books: [] }}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => {
            // Calculate total quantity
            const totalQuantity = values.books.reduce((sum, book) => sum + (book.quantity || 0), 0);

            // Calculate grand total amount
            const grandTotal = values.books.reduce((sum, book) => sum + (book.quantity * book.amount || 0), 0);

            return (
              <Form>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 60 }}>
                    <Autocomplete
                      options={availableBooks}
                      getOptionLabel={(option) => `${option.bookName} (MMS ID: ${option.mmsId})`}
                      value={selectedBooks}
                      onChange={(_, newValue) => setSelectedBooks(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search By Item Name or MMS ID"
                          fullWidth
                          variant="outlined"
                        />
                      )}
                    />
                  </div>
                  <div style={{ flex: 10 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      onClick={() => handleAddBook(values, setFieldValue)}
                      disabled={!selectedBooks}
                    >
                      Add Book
                    </Button>
                  </div>
                  <div style={{ flex: 20 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                      // onClick={() => handleSubmit(values)}
                      disabled={totalQuantity<=0}
                    >
                      Submit
                    </Button>
                  </div>
                  <div style={{ flex: 20 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                {/* Total Quantity and Grand Total Section */}
                <Grid container spacing={2} justifyContent="flex-end" alignItems="center" sx={{ marginTop: '16px' }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                      Quantity: {totalQuantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                      Grand Total: {grandTotal.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Books List Section */}
                <FieldArray name="books">
                  {() => (
                    <div>
                      {values.books.map((book: Books, index: number) => (
                        <Grid container spacing={2} key={book.mmsId} style={{ marginBottom: '16px' }}>
                          <Grid item xs={2}>
                            <Typography variant="body1">{book.bookName}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Field
                              as={TextField}
                              name={`books[${index}].quantity`}
                              type="number"
                              label="Quantity"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">Max Available: {book.maxQuantity}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">Amount: {book.amount}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">Total: {(book.quantity * book.amount || 0).toFixed(2)}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <IconButton onClick={() => handleRemoveBook(index, values, setFieldValue)} color="error">
                              <Cancel />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </Form>
            );
          }}
        </Formik>
      </Paper>
    </Dialog>
  );
};

export default SalesData;