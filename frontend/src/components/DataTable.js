// src/components/DataTable.js
import React, { useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
} from "@mui/material";

function DataTable({ data, onRowSelect, columnOrder }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const headers = columnOrder || (data && data.length > 0 ? Object.keys(data[0]) : []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!data || data.length === 0) return null;

  return (
    <Paper sx={{ my: 2 }}>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              {headers.map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    fontWeight: "bold",
                    padding: "4px",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                    wordBreak: "normal",
                  }}
                >
                  {head.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
              <TableRow key={idx} hover onClick={() => onRowSelect(row)} sx={{ cursor: "pointer" }}>
                {headers.map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      padding: "4px",
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                      wordBreak: "normal",
                    }}
                  >
                    {typeof row[head] === "object" && row[head] !== null
                      ? JSON.stringify(row[head])
                      : row[head]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default DataTable;
