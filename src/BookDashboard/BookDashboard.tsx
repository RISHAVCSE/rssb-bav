import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,TextField,IconButton } from "@mui/material";
import SearchAppBar from "../Components/SearchBar/Search";
import {Edit, Save, Cancel, Delete} from '@mui/icons-material';
import { BooksService } from "../services/booksService";
import AddBook from "./AddBook";

interface Row {
  [key: string]: string | number;
}
type Book = {
  mms_Id?: number;
  book_name?: string;
  quantity?: number;
  amount?: number;
};

const columns = [
  { id: 'mms_Id', label: 'MMS Code', minWidth: 170 },
  { id: 'book_name', label: 'ITEMS', minWidth: 100 },
  {
    id: 'quantity',
    label: 'Quantity',
    minWidth: 170,
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 170,
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'density',
    label: 'Value',
    minWidth: 170,
    format: (value: number) => value.toFixed(2),
  },
  {
    id: 'actions',
    label: 'Actions',
    minWidth: 110,
  }
];

function createData(mms_Id: number, book_name: string, quantity: number, amount: number): Row {
  const density = quantity * amount;
  return { mms_Id, book_name, quantity, amount, density };
}
type AddBookDialogHandle = {
  openDialog: () => void;
};

const BookDashboard: React.FC = () => {
  const addBookRef = useRef<AddBookDialogHandle | null>(null);

  const [page, setPage] = useState(0);
  const [openAddBook, setopenAddBook]=useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm]=useState<string>("");
  const [editingRow, setEditingRow]=useState<number | null>(null);
  const [editingData,setEditingData]=useState<Row | null>(null);

  //OPen Dialog Box
  const openAddBookPopup = () =>{
    if(addBookRef.current){
      addBookRef.current.openDialog();
    }
    setopenAddBook(true);
  }
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleSearchChange=(term: string)=>{
    setSearchTerm(term);
  };



  const loadBooks = async () => {
    try {
      const fetchedBooks = await BooksService.fetchAllBooks();
      console.log(fetchedBooks, "Value is coming from API");

      // Check if the fetched data is an array before proceeding
      if (Array.isArray(fetchedBooks)) {
        const transformedData = fetchedBooks.map((item: any) =>
          createData(item.mms_Id, item.book_name, item.quantity, item.amount)
        );
        setRows(transformedData); // Set the rows to the transformed data
      } else {
        console.error('Fetched data is not an array:', fetchedBooks);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };


  useEffect(() => {
    loadBooks();
  }, []); // Empty dependency array to run this on component mount
  
  const handleBookSubmit = async (newBook: any) => {
    try {
      const addedBook = await BooksService.addBook(newBook);
      loadBooks();

      console.log('Book added successfully:', addedBook);
      // Here you can refresh the list of books or update state
    } catch (error) {
      console.error('Error adding book:', error);
    }
    loadBooks();

  };
  const handleEditClick=(index: number) =>{
    setEditingRow(index);
    setEditingData({...rows[index]});
    
  }

  const handleInputChange=(id: string,value: string |number)=>{
    if(editingData){
      setEditingData((prev)=>({...prev,[id]: value}));
    }
  }

  //Save the Edited row 
  const handleSaveClick= async (index: number)=> {
    if(editingData){
      const updatedRows=[...rows];
      updatedRows[index]=editingData;
      setRows(updatedRows);
      setEditingRow(null);

      try{
        const addedBook = await BooksService.update(editingData,editingData.mms_Id);

        // await BooksService.addBook(editingData);
      } catch(error){
        console.log('Error',error);
      }
    }
  }
  //Cancel the Edit
  const handleCancelClick=()=>{
    setEditingRow(null);
    setEditingData(null);
  }

  // useEffect(() => {
  //   // axios
  //   //   .get('/data.json')  // Fetching directly from the public folder
  //   //   .then((res) => {
  //   //     console.log('Fetched data:', res.data); // Log the data to check its structure
  //       const loadBooks= async ()=>{
  //         try{
  //           const fetchedBooks=await BooksService.fetchAllBooks();
  //           console.log(fetchedBooks,"Value is coming from API");
  //           if (Array.isArray(fetchedBooks)) {
  //             const transformedData = fetchedBooks.map((item: any) =>
  //               createData(item.MMS, item.ITEMS, item.QTY, item.AMOUNT)
  //             );
  //             setRows(transformedData); // Set the rows to the original data initially
  //           }
  //         }
  //       catch (error) {
  //         console.error('Error loading books:', error);
  //       // } finally {
  //       //   setLoading(false);
  //       // }
  //     };
  //       loadBooks();


  //     //   // Check if the data is an array before setting the state
  //     //   if (Array.isArray(res.data.books)) {
  //     //     const transformedData = res.data.books.map((item: any) =>
  //     //       createData(item.MMS, item.ITEMS, item.QTY, item.AMOUNT)
  //     //     );
  //     //     setRows(transformedData); // Set the rows to the original data initially
  //     //   } else {
  //     //     console.error('Fetched data is not an array:', res.data);
  //     //   }
  //     // })
  //     // .catch((err) => console.error('Error fetching data:', err));
  // }, []);
  const filteredRows=rows.filter((row)=>
  Object.values(row).some((value)=>
  value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )
  )

  return (
    <Paper>
      <SearchAppBar title={"Books Table"} onSearchChange={handleSearchChange} />
      <div>

      <button onClick={openAddBookPopup}>Add Books</button>
{openAddBook && <AddBook  ref={addBookRef} onBookSubmit={handleBookSubmit} /> }
      </div>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                //Editing Function
                if(editingRow===index && column.id!=='actions'){
                  return(
                    <TableCell key={column.id}>
                    <TextField
                      value={editingData?.[column.id] || ''}
                      onChange={(e) => handleInputChange(column.id, e.target.value)}
                    />
                  </TableCell> 
                  );
                } else if (column.id === 'actions') {
                  // Render the edit/save/cancel buttons under the Actions column
                  return (
                    <TableCell key={column.id}>
                      {editingRow === index ? (
                        <>
                          <IconButton onClick={() => handleSaveClick(index)}>
                            <Save />
                          </IconButton>
                          <IconButton onClick={handleCancelClick}>
                            <Cancel />
                          </IconButton>
                        </>
                      ) : (
                        <>
                        <IconButton onClick={() => handleEditClick(index)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleEditClick(index)}>
                        <Delete />
                      </IconButton>
                      </>
                      )}
                    </TableCell>
                  );
                }
                
                else{

                      return (
                        <TableCell key={column.id}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    }
                    })}
             {/* Actions: Edit/Save and Cancel */}
{/* 
                     <TableCell>
                  {editingRow === index ? (
                    <>
                      <IconButton onClick={() => handleSaveClick(index)}>
                        <Save />
                      </IconButton>
                      <IconButton onClick={handleCancelClick}>
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton onClick={() => handleEditClick(index)}>
                      <Edit />
                    </IconButton>
                  )}
                </TableCell> */}
                  </TableRow>
                );
              })}
              
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default BookDashboard;
