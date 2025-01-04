import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
} from "@mui/material";
import SearchAppBar from "../Components/SearchBar/Search";
import { Edit, Save, Cancel, Delete,ExpandMore, ExpandLess } from "@mui/icons-material";
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
  { id: "mms_Id", label: "MMS Code", minWidth: 170 },
  { id: "book_name", label: "ITEMS", minWidth: 100 },
  {
    id: "quantity",
    label: "Quantity",
    minWidth: 170,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "amount",
    label: "Amount",
    minWidth: 170,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "density",
    label: "Value",
    minWidth: 170,
    format: (value: number) => value.toFixed(2),
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 110,
  },
];

function createData(
  mms_Id: number,
  book_name: string,
  quantity: number,
  amount: number
): Row {
  const density = quantity * amount;
  return { mms_Id, book_name, quantity, amount, density };
}

type AddBookDialogHandle = {
  openDialog: () => void;
};

const BookDashboard: React.FC = () => {
  const addBookRef = useRef<AddBookDialogHandle | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Row | null>(null);
  const [originalData, setOriginalData] = useState<Row | null>(null);

  //For Expand
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);

  const handleRowClick = async (mms_Id: number) => {
    // Toggle the expanded row
    if (expandedRow === mms_Id) {
      setExpandedRow(null);
      setExpandedData(null);
      return;
    }
    
    setExpandedRow(mms_Id); // Set the new expanded row
  
    try {
      // const response = await BooksService.fetchBookDetails(mms_Id); // Replace with the appropriate service call
      // setExpandedData(response); // Store the fetched data to pass to the component
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };
  


  // Open AddBook Dialog
  const openAddBookPopup = () => {
    if (addBookRef.current) {
      addBookRef.current.openDialog();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };


  const loadBooks = async () => {
    try {
      const fetchedBooks = await BooksService.fetchAllBooks();
      if (Array.isArray(fetchedBooks)) {
        const transformedData = fetchedBooks.map((item: any) =>
          createData(item.mms_Id, item.book_name, item.quantity, item.amount)
        );
        setRows(transformedData);
      } else {
        console.error("Fetched data is not an array:", fetchedBooks);
      }
    } catch (error) {
      console.error("Error loading books:", error);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleBookSubmit = async (newBook: any) => {
    try {
      await BooksService.addBook(newBook);
      loadBooks(); // Refresh after adding a book
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  const handleEditClick = (mms_Id: number) => {
    setEditingRowId(mms_Id);
    const rowData = rows.find(row => row.mms_Id === mms_Id);
    if (rowData) {
      setOriginalData({ ...rowData });
      setEditingData({ ...rowData });
    }
  };

  const handleInputChange = (id: string, value: string | number) => {
    if (editingData) {
      setEditingData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSaveClick = async () => {
    if (editingData && editingData.mms_Id) {
      const updatedRows = rows.map(row =>
        row.mms_Id === editingData.mms_Id ? editingData : row
      );
      setRows(updatedRows);
      setEditingRowId(null);
      setEditingData(null);

      try {
        await BooksService.update(editingData, editingData.mms_Id);
      
      } catch (error) {
        console.error("Error saving book:", error);
      }
    }
    loadBooks();

  };

  const handleCancelClick = () => {
    if (originalData) {
      const updatedRows = rows.map((row) =>
        row.mms_Id === originalData.mms_Id ? originalData : row
      );
      setRows(updatedRows);
    }
    setEditingRowId(null);
    setEditingData(null);
    setOriginalData(null);
  };

  const handleDeleteClick = async () => {
    try {
      // await BooksService.addBook(mms_Id);
      // setRows(rows.filter((row) => row.mms_Id !== mms_Id));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Paper>
      <SearchAppBar title={"Books Table"} onSearchChange={handleSearchChange} />
      <div>
        <button onClick={openAddBookPopup}>Add Books</button>
        <AddBook ref={addBookRef} onBookSubmit={handleBookSubmit} />
      </div>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
      {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
        const isEditing = row.mms_Id === editingRowId;
        const isExpanded = row.mms_Id === expandedRow; // Track if the row is expanded

        return (
          <React.Fragment key={row.mms_Id}>
            <TableRow hover role="checkbox" tabIndex={-1}>
              {columns.map((column) => {
                const value = row[column.id];

                // Check if this column is for editing fields
                if (isEditing && column.id !== "actions") {
                  return (
                    <TableCell key={column.id}>
                      <TextField
                        value={editingData?.[column.id] || ""}
                        onChange={(e) => handleInputChange(column.id, e.target.value)}
                      />
                    </TableCell>
                  );
                } else if (column.id === "actions") {
                  return (
                    <TableCell key={column.id}>
                      {isEditing ? (
                        <>
                          <IconButton onClick={handleSaveClick}>
                            <Save />
                          </IconButton>
                          <IconButton onClick={handleCancelClick}>
                            <Cancel />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditClick(row.mms_Id as number)}>
                            <Edit />
                          </IconButton>
                          {isExpanded ? (
                            <IconButton onClick={() => setExpandedRow(null)}>
                              <ExpandLess />
                            </IconButton>
                          ) : (
                            <IconButton onClick={() => handleRowClick(row.mms_Id as number)}>
                              <ExpandMore />
                            </IconButton>
                          )}
                        </>
                      )}
                    </TableCell>
                  );
                } else {
                  return (
                    <TableCell key={column.id}>
                      {column.format && typeof value === "number" ? column.format(value) : value}
                    </TableCell>
                  );
                }
              })}
            </TableRow>

            {/* Conditionally render expanded row */}
            {isExpanded && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  {/* Expanded content goes here */}
                  {/* Example: <ExpandedBookDetails data={expandedData} /> */}
                  {row.mms_Id}
                  <div>Additional details about this book can go here.</div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
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
