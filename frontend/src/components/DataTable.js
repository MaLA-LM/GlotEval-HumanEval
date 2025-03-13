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
  IconButton,
  Collapse,
  Box,
  Button,
  TextField,
} from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CategoryFilter from "./CategoryFilter";
import TranslatorOutside from "./TranslatorOutside";

function DataTable({
  data,
  onRowSelect,
  taskType,
  columnOrder,
  isViewMode = false,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ predicted: "", correct: "" });
  const [expandedRow, setExpandedRow] = useState(null);
  const [jumpToIndex, setJumpToIndex] = useState("");
  const headers =
    columnOrder || (data && data.length > 0 ? Object.keys(data[0]) : []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle row expansion
  const handleExpandClick = (row) => {
    setExpandedRow(expandedRow === row ? null : row);
  };
  // Filter the data based on selected category values (ONLY for classification task)
  const filteredData = data.filter((row) => {
    const matchesPredicted = filters.predicted
      ? row.predicted_category === filters.predicted
      : true;
    const matchesCorrect = filters.correct
      ? row.correct_category === filters.correct
      : true;
    return matchesPredicted && matchesCorrect;
  });
  // Reset pagination if current page is out of range after filtering
  React.useEffect(() => {
    if (page > Math.floor(filteredData.length / rowsPerPage)) {
      setPage(0);
    }
  }, [filteredData.length, rowsPerPage, page]);

  if (!data || data.length === 0) return null;
  // Handle jump-to functionality
  const handleJumpTo = () => {
    const index = parseInt(jumpToIndex, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < data.length) {
      const newPage = Math.floor(index / rowsPerPage);
      setPage(newPage);
    }
  };
  return (
    <Paper sx={{ my: 2 }}>
      {/* Display filter only when the header contains 'predicted_category' and 'correct_category */}
      <CategoryFilter
        data={data}
        columnOrder={headers}
        onFilterChange={setFilters}
      />

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
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, idx) => (
                <React.Fragment key={idx}>
                  {/* main row */}
                  <TableRow
                    key={idx}
                    hover
                    // onClick={() => onRowSelect(row)}
                    onClick={() => handleExpandClick(row)}
                    sx={{ cursor: "pointer" }}
                  >
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
                          : head === "model_name"
                          ? `${row[head]} (${page * rowsPerPage + idx + 1})`
                          : row[head]}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Expanded Row */}
                  <TableRow>
                    <TableCell
                      colSpan={columnOrder.length + 1}
                      style={{ padding: 0 }}
                    >
                      <Collapse
                        in={expandedRow === row}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            padding: "10px",
                            flexWrap: "nowrap",
                          }}
                        >
                          {!isViewMode && (
                            <Button
                              size="small"
                              color="secondary"
                              onClick={() => onRowSelect(row)}
                              disabled={isViewMode}
                              sx={{ alignSelf: "flex-start" }}
                              startIcon={<RateReviewIcon />}
                            >
                              Feedback
                            </Button>
                          )}

                          <Box sx={{ width: "100%" }}>
                            <TranslatorOutside
                              row={row}
                              taskType={taskType}
                              showTextField={true}
                            />
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {/* JumpToIndex */}
        <box style={{ display: "flex", alignItems: "center", padding: "10px" }}>
          <TextField
            label="Enter Index"
            variant="outlined"
            size="small"
            value={jumpToIndex}
            onChange={(e) => setJumpToIndex(e.target.value)}
            sx={{ marginRight: 1, width: "120px" }}
          />
          <Button variant="contained" onClick={handleJumpTo}>
            Skip
          </Button>
        </box>
      </Box>
    </Paper>
  );
}

export default DataTable;
