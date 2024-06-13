import React, { useState, useEffect } from "react";
import axios from "axios";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from "@mui/material";
import { useParams } from "react-router-dom";
import SearchBar from "material-ui-search-bar";

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
  const { id } = useParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [originalRows, setOriginalRows] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [searched, setSearched] = useState<string>("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // const requestSearch = (searchedVal: string) => {
  //   if (searchedVal.trim() === '') {
  //     // Reset rows to original rows when search input is empty
  //     setRows(originalRows);
  //   } else {
  //     const filteredRows = originalRows.filter((row) => {
  //       return Object.values(row).some(
  //         (value) =>
  //           typeof value === 'string' &&
  //           value.toLowerCase().includes(searchedVal.toLowerCase())
  //       );
  //     });
  //     setRows(filteredRows);
  //   }
  // };
  // const requestSearch = (searchedVal: string) => {
  //   if (searchedVal.trim() === '') {
  //     // Reset rows to original rows when search input is empty
  //     setRows(originalRows);
  //   } else {
  //     const filteredRows = originalRows.filter((row) => {
  //       return (
  //         (typeof row.name === 'string' && row.name.toLowerCase().includes(searchedVal.toLowerCase())) ||
  //         (typeof row.code === 'string' && row.code.toLowerCase().includes(searchedVal.toLowerCase()))
  //       );
  //     });
  //     setRows(filteredRows);
  //   }
  // };
  const requestSearch = (searchedVal: string) => {
    if (searchedVal.trim() === '') {
      // Reset rows to original rows when search input is empty
      setRows(originalRows);
    } else {
      const filteredRows = originalRows.filter((row) => {
        const nameString = row.name.toString().toLowerCase();
        const codeString = row.code.toString().toLowerCase();
        return nameString.includes(searchedVal.toLowerCase()) || codeString.includes(searchedVal.toLowerCase());
      });
      setRows(filteredRows);
    }
  };


  const cancelSearch = () => {
    setSearched("");
    setRows(originalRows);
  };

  useEffect(() => {
    axios
      .get('/data.json')  // Fetching directly from the public folder
      .then((res) => {
        console.log('Fetched data:', res.data); // Log the data to check its structure

        // Check if the data is an array before setting the state
        if (Array.isArray(res.data.books)) {
          const transformedData = res.data.books.map((item: any) =>
            createData(item.MMS, item.ITEMS, item.QTY, item.AMOUNT)
          );
          setOriginalRows(transformedData); // Set the original data
          setRows(transformedData); // Set the rows to the original data initially
        } else {
          console.error('Fetched data is not an array:', res.data);
        }
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  return (
    <Paper>
      <SearchBar
        value={searched}
        onChange={(searchVal) => requestSearch(searchVal)}
        onCancelSearch={() => cancelSearch()}
      />
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
            {rows
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
