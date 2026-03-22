import React, { useState, useEffect, useRef } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TextField, IconButton, Box, Drawer, Button, Typography, Toolbar,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Tab,
  Tabs
} from "@mui/material";
import SearchAppBar from "../Components/SearchBar/Search";
import { Edit, Save, Cancel, ExpandMore, ExpandLess } from "@mui/icons-material";
import { BooksService } from "../services/booksService";
import AddBook from "./AddBook";
import CustomSnackbar from "../CustomSnackBar/CustomSnackBar";
import AllotedBookTable from "../AllotedBookTable/AllotedBookTable";
import PhoneIcon from '@mui/icons-material/Phone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonPinIcon from '@mui/icons-material/PersonPin';

// Define the drawer width
const drawerWidth = 240;

interface Row {
  [key: string]: string | number;
}

const columns = [
  { id: "mmsId", label: "MMS Code", minWidth: 100 },
  { id: "type", label: "Type", minWidth: 100 },
  { id: "bookName", label: "Name", minWidth: 150, editable: true },
  { id: "stockavailable", label: "Quantity Available", minWidth: 120, align: "right", editable: true },
  { id: "allotedQuantity", label: "Quantity Alloted", minWidth: 120, align: "right" },
  { id: "pendingForApprovalQuantity", label: "Pending For Sale", minWidth: 120, align: "right" },
  { id: "amount", label: "Price", minWidth: 100, align: "right", editable: true },
  { id: "density", label: "Quantity Available Value", minWidth: 150, align: "right", format: (value: number) => value.toFixed(2) },
  { id: "actions", label: "Actions", minWidth: 100, align: "center" },
];

const BookDashboard: React.FC = () => {
  const addBookRef = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Row | null>(null);
  const [originalData, setOriginalData] = useState<Row | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const bookTypes = [
  { value: 1, label: 'Books' },
  { value: 2, label: 'Photo' },
  { value: 3, label: 'Miscellaneous' },
  { value: 0, label: 'All' },
];
const getBookTypeLabel = (typeValue: number) => {
  const found = bookTypes.find(t => t.value === typeValue);
  return found ? found.label : "Unknown";
};


  const loadBooks = async () => {
    try {
      const fetchedBooks = await BooksService.fetchAllDetails(value);
      if (Array.isArray(fetchedBooks)) {
        const transformedData = fetchedBooks.map((item: any) => ({
          mmsId: item.mmsId,
          type: item.type,
          bookName: item.bookName,
          stockavailable: item.quantity - item.allotedQuantity - item.pendingForApprovalQuantity,
          allotedQuantity: item.allotedQuantity,
          pendingForApprovalQuantity: item.pendingForApprovalQuantity,
          amount: item.amount,
          density: (item.quantity - item.allotedQuantity - item.pendingForApprovalQuantity) * item.amount
        }));
        setRows(transformedData);
      }
    } catch (error) {
      console.error("Error loading books:", error);
    }
  };
  const [value, setValue] = React.useState(1);

  // useEffect(() => { loadBooks(); }, [value]);
  useEffect(() => {
  loadBooks();
}, [value]); // This triggers loadBooks whenever 'value' changes

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    loadBooks();
  };
  const handleEditClick = (row: Row) => {
    setEditingRowId(row.mmsId as number);
    setOriginalData({ ...row });
    setEditingData({ ...row });
  };

  const handleSaveClick = async () => {
    if (editingData) {
      try {
        const { message } = await BooksService.update(editingData, editingData.mmsId);
        setSnackbar({ open: true, message, type: "success" });
        setEditingRowId(null);
        loadBooks();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message || "Update failed", type: "error" });
      }
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomSnackbar 
        open={snackbar.open} 
        handleClose={() => setSnackbar({ ...snackbar, open: false })} 
        message={snackbar.message} 
        type={snackbar.type} 
      />

      {/* Sidebar Drawer */}
      {/* <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6">Book Details</Typography>
        </Box>
      </Drawer> */}

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <SearchAppBar title={"Books Inventory"} onSearchChange={setSearchTerm} />
          {/* <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="book" control={<Radio />} label="Books" />
        <FormControlLabel value="photo" control={<Radio />} label="Photos" />
        <FormControlLabel value="other" control={<Radio />} label="Other" />
        <FormControlLabel value="all" control={<Radio />} label="All" />

        
      </RadioGroup>
    </FormControl> */}


<Box sx={{ bgcolor: 'background.paper', width: '100%', borderRadius: 2 }}>

    <Tabs  sx={{
              '& .MuiTabs-indicator': {
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.875rem',
                minHeight: 48,
              }
            }} value={value} variant="fullWidth" onChange={handleChange}>
      <Tab label="Books" value={1}  aria-label="phone" />
      <Tab label="Photos"  value={2} aria-label="favorite" />
      <Tab label="Miscellenaus"  value={3} aria-label="person" />
     <Tab label="All"  value={0} aria-label="person" />

    </Tabs>
    </Box>



        <Box sx={{ mb: 2, mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={() => addBookRef.current?.openDialog()}>
            Add New Book
          </Button>
          <AddBook ref={addBookRef} onBookSubmit={loadBooks} />
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align as any} style={{ minWidth: column.minWidth, fontWeight: 'bold' }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .filter(row => JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const isEditing = row.mmsId === editingRowId;
                  const isExpanded = row.mmsId === expandedRow;

                  return (
                    <React.Fragment key={row.mmsId}>
                      <TableRow hover>
                        {columns.map((column) => {
                          if (column.id === "actions") {
                            return (
                              <TableCell key={column.id} align="center">
                                {isEditing ? (
                                  <>
                                    <IconButton onClick={handleSaveClick} color="primary"><Save /></IconButton>
                                    <IconButton onClick={() => setEditingRowId(null)} color="error"><Cancel /></IconButton>
                                  </>
                                ) : (
                                  <>
                                    <IconButton onClick={() => handleEditClick(row)} size="small"><Edit /></IconButton>
                                    <IconButton onClick={() => setExpandedRow(isExpanded ? null : row.mmsId as number)} size="small">
                                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                  </>
                                )}
                              </TableCell>
                            );
                          }

                          const value = row[column.id];
                          return (
                            // <TableCell key={column.id} align={column.align as any}>
                            //   {isEditing && column.editable ? (
                            //     <TextField
                            //       variant="standard"
                            //       value={editingData?.[column.id] || ""}
                            //       onChange={(e) => setEditingData({ ...editingData!, [column.id]: e.target.value })}
                            //     />
                            //   ) : (
                            //     column.format && typeof value === "number" ? column.format(value) : value
                            //   )}
                            // </TableCell>
                              <TableCell key={column.id} align={column.align as any}>
    {isEditing && column.editable ? (
      <TextField
        variant="standard"
        // Ensure numbers stay numbers if the field is for amount/quantity
        type={typeof value === 'number' ? 'number' : 'text'} 
        value={editingData?.[column.id] || ""}
        onChange={(e) => setEditingData({ 
          ...editingData!, 
          [column.id]: column.id === 'amount' || column.id === 'stockavailable' 
            ? Number(e.target.value) 
            : e.target.value 
        })}
      />
    ) : (
      /* ADD THIS CHECK BELOW */
      column.id === "type" 
        ? getBookTypeLabel(value as number) 
        : (column.format && typeof value === "number" ? column.format(value) : value)
    )}
  </TableCell>

                          );
                        })}
                      </TableRow>
                      {isExpanded && (
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                          <TableCell colSpan={columns.length}>
                            <Box sx={{ margin: 2 }}>
                               <AllotedBookTable mmsId={row.mmsId as number} onApiComplete={loadBooks} />
                            </Box>
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
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
        />
      </Box>
    </Box>
  );
};

export default BookDashboard;