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
  MenuItem,
  Button,
} from "@mui/material";
import SearchAppBar from "../Components/SearchBar/Search";
import { Edit, Save, Cancel, Delete,ExpandMore, ExpandLess } from "@mui/icons-material";
import { BooksService } from "../services/booksService";
import AllotedBookTable from "../AllotedBookTable/AllotedBookTable";
import { CentreService } from "../services/centreService";
import { AllotedBookService } from "../services/allotedBookService";
import SalesData from "./SalesData";

interface Row {
  [key: string]: string | number;
}
type Book = {
  mmsId?: number;
  bookName?: string;
  quantity?: number;
  amount?: number;
};
interface ICentre {
    centreCode: number;
    centreName: string;
  }

const columns = [
  { id: "mmsId", label: "MMS Code", minWidth: 170 },
  { id: "bookName", label: "ITEMS", minWidth: 100 },
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
  mmsId: number,
  bookName: string,
  quantity: number,
  amount: number
): Row {
  const density = quantity * amount;
  return { mmsId, bookName, quantity, amount, density };
}

type AddBookDialogHandle = {
  openDialog: () => void;
};

const CentreData: React.FC = () => {
//   const addBookRef = useRef<AddBookDialogHandle | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Row | null>(null);
  const [originalData, setOriginalData] = useState<Row | null>(null);



  //For CentreDropdown
  const [centreList,setCentreList]=useState<ICentre[]>([]);
  const [selectedCentre,setSelectedCentre]=useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(()=>{
    const fetchAllCentre=async()=>{
        try {
            const centres=await CentreService.fetchAllCentre();
            setCentreList(centres);
            if(centres.length>0){
                setSelectedCentre(centres[0]);
            }
        } catch(error){

        }
    };
    fetchAllCentre();
  },[]);

  const handleCentreChange=(event: React.ChangeEvent<{value: unknown}>)=>{
    const selectedCentreCode=Number(event.target.value);
    const selectCentre=centreList.find((c)=> c.centreCode===selectedCentreCode);
    if(selectCentre){
        setSelectedCentre(selectCentre);
        loadBooks(selectCentre.centreCode);

    }
  }

  const handleDataFromChild = async(data: any)=>{
    try {
      const newCentre={
          centreCode: selectedCentre.centreCode,
          books: data.books,
          currentTime: "2023-10-25T12:34:56",
      }
      await AllotedBookService.salesData(newCentre);
    
    } catch (error) {
      console.error("Error saving book:", error);
    }
  
  loadBooks(selectedCentre.centreCode);
    setIsDialogOpen(false);
  }


  


  // Open AddBook Dialog
//   const openAddBookPopup = () => {
//     if (addBookRef.current) {
//       addBookRef.current.openDialog();
//     }
//   };

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


  const loadBooks = async (centreCode: any) => {
    try {
      const fetchedBooks = await AllotedBookService.getAllBookBasedUponCentre(centreCode);
      if (Array.isArray(fetchedBooks)) {
        const transformedData = fetchedBooks.map((item: any) =>
          createData(item.book.mmsId, item.book.bookName, item.allocatedQuantity, item.book.amount)
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
    if (selectedCentre) {
      loadBooks(selectedCentre.centreCode);
    }
  }, [selectedCentre]);


  const handleEditClick = (mmsId: number) => {
    setEditingRowId(mmsId);
    const rowData = rows.find(row => row.mmsId === mmsId);
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
    if (editingData && editingData.mmsId) {
      const updatedRows = rows.map(row =>
        row.mmsId === editingData.mmsId ? editingData : row
      );
      setEditingRowId(null);
      setEditingData(null);

      try {
        const newCentre={
            centreCode: selectedCentre.centreCode,
            quantity: editingData.quantity,
            mmsId: editingData.mmsId,
        }
        await AllotedBookService.allocateOrChangeCenterData(newCentre);
      
      } catch (error) {
        console.error("Error saving book:", error);
      }
    }
    loadBooks(selectedCentre.centreCode);

  };
  
 const handleOpenDialog=()=>{
  setIsDialogOpen(true);

 }
 const handleCloseDialog=()=>{
  setIsDialogOpen(false);
 }
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
    <Paper >
      <SearchAppBar title={selectedCentre?.centreName|| null} onSearchChange={handleSearchChange} />
      <div>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Open Sales Data Dialog
      </Button>
        <SalesData openState={isDialogOpen} onDataSubmit={handleDataFromChild} items={rows} onClose={handleCloseDialog}/>
      </div>
      <div  style={{display: "flex",justifyContent: "flex-end",margin: "16px"}}>
        <TextField
         select 
         label="Select Centre" 
         value={selectedCentre?.centreCode || ""} 
         onChange={handleCentreChange}
         style={{minWidth: "200px"}}>
            {centreList.map((center)=>(
                <MenuItem key={center.centreCode} value={center.centreCode}>
                    {center.centreName}
                </MenuItem>
            ))}
         </TextField>
       
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

        return (
          <React.Fragment key={row.mmsId}>
            <TableRow hover role="checkbox" tabIndex={-1}>
              {columns.map((column) => {
                const value = row[column.id];

                // Check if this column is for editing fields
                if (isEditing && column.id === "quantity") {
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
                          <IconButton onClick={() => handleEditClick(row.mmsId as number)}>
                            <Edit />
                          </IconButton>
                         
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

export default CentreData;
