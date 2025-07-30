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
import CustomSnackbar from "../CustomSnackBar/CustomSnackBar";
import AllotedBookTable from "../AllotedBookTable/AllotedBookTable";

interface Row {
  [key: string]: string | number;
}
type Book = {
  mmsId?: number;
  bookName?: string;
  quantity?: number;
  allotedQuantity?: number;
  amount?: number;
};

const columns = [
  { id: "mmsId", label: "MMS Code", minWidth: 170  },
  { id: "bookName", label: "ITEMS", minWidth: 100, editable:true },
  {
    id: "stockavailable",
    label: "Quantity Available",
    minWidth: 170,
    editable:true,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "allotedQuantity",
    label: "Quantity Alloted",
    minWidth: 170,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "pendingForApprovalQuantity",
    label: "Pending For Sale",
    minWidth: 170,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "amount",
    label: "Price",
    minWidth: 170,
    editable:true,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "density",
    label: "Quantity Available Value",
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
  mmsId: number,
  bookName: string,
  quantity: number,
  amount: number,
  allotedQuantity: number,
  pendingForApprovalQuantity: number
): Row {
  const stockavailable=quantity-allotedQuantity-pendingForApprovalQuantity;
  const density = stockavailable * amount;

  return { mmsId, bookName, stockavailable,allotedQuantity,pendingForApprovalQuantity, amount, density };
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

  //SnackBar
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    type: "success" | "error"; 
}>({
    open: false,
    message: "",
    type: "success"
});

  //For Expand
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);

  const handleRowClick = async (mmsId: number) => {
    // Toggle the expanded row
    if (expandedRow === mmsId) {
      setExpandedRow(null);
      setExpandedData(null);
      return;
    }
    
    setExpandedRow(mmsId); // Set the new expanded row
  
    try {
      // const response = await BooksService.fetchBookDetails(mmsId); // Replace with the appropriate service call
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
          createData(item.mmsId, item.bookName, item.quantity, item.amount,item.allotedQuantity,item.pendingForApprovalQuantity)
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
      const { message } = await BooksService.addBook(newBook);
      setSnackbar({
          open: true,
          message: message, // Use the API's success message
          type: "success"
      });
      await loadBooks();
  } catch (error: any) {
        setSnackbar({ 
            open: true, 
            message: error.message || "Something went wrong!", 
            type: "error" 
        });
        console.error("Error adding book:", error);
    }
};

  const handleEditClick = (mmsId: number) => {
    setEditingRowId(mmsId);
    const rowData = rows.find(row => row.mmsId === mmsId);
    if (rowData) {
      setOriginalData({ ...rowData });
      setEditingData({ ...rowData, stockavailable: "" }); // clear stockavailable

    }
  };

  const handleInputChange = (id: string, value: string | number) => {
    if (editingData) {
      setEditingData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSaveClick = async () => {
    if (editingData && editingData.mmsId) {
      const updatedRows = rows.map(row =>
        row.mmsId === editingData.mmsId ? editingData : row
      );
      setRows(updatedRows);
      setEditingRowId(null);
      setEditingData(null);

      try {
       
        const { message } =  await BooksService.update(editingData, editingData.mmsId);
        setSnackbar({
            open: true,
            message: message, // Use the API's success message
            type: "success"
        });
        await loadBooks();
      } catch (error: any) {
        setSnackbar({ 
          open: true, 
          message: error.message || "Something went wrong!", 
          type: "error" 
      });
        console.error("Error saving book:", error);
      }
    }
    loadBooks();

  };

  const handleCancelClick = () => {
    if (originalData) {
      const updatedRows = rows.map((row) =>
        row.mmsId === originalData.mmsId ? originalData : row
      );
      setRows(updatedRows);
    }
    setEditingRowId(null);
    setEditingData(null);
    setOriginalData(null);
  };

  const handleDeleteClick = async () => {
    try {
      // await BooksService.addBook(mmsId);
      // setRows(rows.filter((row) => row.mmsId !== mmsId));
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
 <CustomSnackbar 
        open={snackbar.open} 
        handleClose={() => setSnackbar({ ...snackbar, open: false })} 
        message={snackbar.message} 
        type={snackbar.type} 
      />
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
        const isEditing = row.mmsId === editingRowId;
        const isExpanded = row.mmsId === expandedRow; // Track if the row is expanded

        return (
          <React.Fragment key={row.mmsId}>
            <TableRow hover role="checkbox" tabIndex={-1}>
              {columns.map((column) => {
                const value = row[column.id];

                // Check if this column is for editing fields
                if (isEditing && column.editable && column.id !== "actions") {
                  return (
                    <TableCell key={column.id}>
                      <TextField
        value={editingData?.[column.id] || ""}
        onChange={(e) => handleInputChange(column.id, e.target.value)}
        placeholder={column.id === 'stockavailable' 
          ? `Current: ${originalData?.stockavailable}` 
          : ''}
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
                          <IconButton onClick={() => handleEditClick(row.mmsId as number)}>
                            <Edit />
                          </IconButton>
                          {isExpanded ? (
                            <IconButton onClick={() => setExpandedRow(null)}>
                              <ExpandLess />
                            </IconButton>
                          ) : (
                            <IconButton onClick={() => handleRowClick(row.mmsId as number)}>
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
                  <AllotedBookTable mmsId={row.mmsId} onApiComplete={loadBooks} />
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
