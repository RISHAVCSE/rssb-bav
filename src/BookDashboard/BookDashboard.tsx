import React, { useState, useEffect } from "react";
import axios from "axios";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from "@mui/material";
import SearchAppBar from "../Components/SearchBar/Search";
import { BooksService } from "../services/booksService";

interface Row {
  [key: string]: string | number;
}

const columns = [
  { id: 'name', label: 'MMS Code', minWidth: 170 },
  { id: 'code', label: 'ITEMS', minWidth: 100 },
  {
    id: 'population',
    label: 'Quantity',
    minWidth: 170,
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'size',
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
];

function createData(name: string, code: string, population: number, size: number): Row {
  const density = population * size;
  return { name, code, population, size, density };
}

const BookDashboard: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm]=useState<string>("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleSearchChange=(term: string)=>{
    setSearchTerm(term);
  }

  

  useEffect(() => {
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
  
    loadBooks();
  }, []); // Empty dependency array to run this on component mount
  

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
                      return (
                        <TableCell key={column.id}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
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
