import React, { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
} from "@mui/material";
import { ArrowForward, ArrowBack } from "@mui/icons-material";

const TableData = ({ results, selectedModels, selectedLanguages }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleChangePage = (direction) => {
    if (direction === "next") {
      setPage((prevPage) =>
        Math.min(prevPage + 1, Math.ceil(results.length / rowsPerPage) - 1)
      );
    } else if (direction === "back") {
      setPage((prevPage) => Math.max(prevPage - 1, 0));
    }
  };

  return (
    <Box xs={12} md={9} lg={8} sx={{ padding: 2 }}>
      {results && (
        <>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.700", color: "#fff" }}>
                <TableCell sx={{ bgcolor: "grey.700", color: "#fff" }}>
                  Model
                </TableCell>
                {selectedLanguages.map((lang) => (
                  <TableCell
                    key={lang}
                    sx={{ bgcolor: "grey.700", color: "#fff" }}
                  >
                    {lang}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedModels
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((model) => {
                  const foundItem =
                    results.find((item) => item.Models === model) || {};

                  return (
                    <TableRow
                      key={model}
                      sx={{ bgcolor: "#ffffff", color: "#000000" }}
                    >
                      <TableCell sx={{ bgcolor: "#ffffff", color: "#000000" }}>
                        {model}
                      </TableCell>
                      {selectedLanguages.map((lang) => {
                        const value = foundItem[lang] ?? "N/A";
                        return (
                          <TableCell
                            key={lang}
                            sx={{ bgcolor: "#ffffff", color: "#000000" }}
                          >
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <IconButton
              onClick={() => handleChangePage("back")}
              disabled={page === 0}
            >
              <ArrowBack />
            </IconButton>
            <Typography sx={{ mx: 2 }}>{page + 1}</Typography>
            <IconButton
              onClick={() => handleChangePage("next")}
              disabled={page >= Math.ceil(results.length / rowsPerPage) - 1}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TableData;
