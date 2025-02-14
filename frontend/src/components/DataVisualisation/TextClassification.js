import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { getFilename } from "./FileName";
// import { saveAs } from 'file-saver';
// import html2canvas from 'html2canvas';

const TextClassification = ({ externalTabValue, filters }) => {
  const [csvData, setCsvData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [languagePage, setLanguagePage] = React.useState(0);

  // Effect to fetch CSV data when filters change
  React.useEffect(() => {
    // Reset previous state
    setCsvData(null);
    setIsLoading(false);
    setError(null);
    setLanguagePage(0);

    // Debugging: Log entire filters object
    console.log("Full Filters Object:", filters);

    // Check if we have a dataset to fetch
    if (!filters?.dataset) {
      setError("Please select a dataset");
      return;
    }

    // Start loading
    setIsLoading(true);

    // Fetch CSV file
    fetch(`/${getFilename(filters.dataset, filters.metric)}.csv`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((text) => {
        // Debugging: Log raw CSV text
        console.log("Raw CSV Text:", text);

        // Parse CSV text into array of objects
        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        if (lines.length > 1) {
          const headers = lines[0].split(",").map((h) => h.trim());
          const data = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {});
          });

          // Debugging: Log parsed data
          console.log("Parsed Data:", data);
          console.log("Headers:", headers);

          // Filter data based on language selection if applicable
          if (filters.filterType === "language" && filters.filterValue) {
            const filterValues = Array.isArray(filters.filterValue)
              ? filters.filterValue
              : [filters.filterValue];

            console.log("Filtering languages:", filterValues);

            const filteredData = data.filter((row) => {
              const isMatch = filterValues.some((lang) =>
                headers.includes(lang)
              );

              console.log(`Row Languages: ${headers}, Matches: ${isMatch}`);

              return isMatch;
            });

            console.log("Filtered Data:", filteredData);

            if (filteredData.length === 0) {
              setError(`No data found for languages: ${filterValues.join(
                ", "
              )}. 
                Available languages: ${[...new Set(headers)].join(", ")}`);
              setIsLoading(false);
              return;
            }

            setCsvData(filteredData);
          } else if (filters.filterType === "model" && filters.filterValue) {
            // Find the model row
            const modelRow = data.find(
              (row) => row[headers[0]] === filters.filterValue
            );

            if (modelRow) {
              // Find the 'avg' column index
              const avgColumnIndex = headers.findIndex(
                (h) =>
                  h.toLowerCase() === "avg" || h.toLowerCase() === "average"
              );

              // Prepare language data for graph
              const languageColumns = headers.slice(avgColumnIndex + 1);
              const graphData = languageColumns
                .map((lang) => ({
                  language: lang,
                  value: parseFloat(modelRow[lang]) || 0,
                }))
                .filter((item) => item.value > 0)
                .sort((a, b) => b.value - a.value);

              if (graphData.length === 0) {
                setError(
                  `No performance data found for ${filters.filterValue}`
                );
                setIsLoading(false);
                return;
              }

              setCsvData(graphData);
            } else {
              setError(`Model ${filters.filterValue} not found in the dataset`);
            }
          } else {
            setCsvData(data);
          }
        } else {
          throw new Error("CSV file is empty or malformed");
        }

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching CSV:", error);
        setError(error.message);
        setIsLoading(false);
      });
  }, [filters]);

  // Render loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="400px"
        sx={{
          backgroundColor: "#f8f8f8",
          borderRadius: 2,
          p: 2,
          width: "calc(100% - 60px)",
          marginLeft: "30px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="400px"
        sx={{
          backgroundColor: "#f8f8f8",
          borderRadius: 2,
          p: 2,
          width: "calc(100% - 60px)",
          marginLeft: "30px",
        }}
      >
        <Typography color="error" variant="body1" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  // Render no data state
  if (!csvData || csvData.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="400px"
        sx={{
          backgroundColor: "#f8f8f8",
          borderRadius: 2,
          p: 2,
          width: "calc(100% - 60px)",
          marginLeft: "30px",
        }}
      >
        <Typography variant="body1" align="center" color="textSecondary">
          No data available. Please select a dataset and apply filters.
        </Typography>
      </Box>
    );
  }

  // Render graph for language selection
  if (filters.filterType === "language") {
    // Debugging: Log current csvData
    console.log("Current csvData:", csvData);
    console.log("Current Filter Values:", filters.filterValue);

    // Get all language columns (excluding metadata columns)
    const allLanguageColumns = Object.keys(csvData[0] || {}).filter(
      (key) => key !== "id" && key !== "_id" && key !== "timestamp"
    );

    // Ensure filterValue is an array
    const selectedLanguages = Array.isArray(filters.filterValue)
      ? filters.filterValue
      : [filters.filterValue];

    // Filter language columns to only include selected languages
    const languageColumns = allLanguageColumns.filter((lang) =>
      selectedLanguages.includes(lang)
    );

    // Paginate languages (3 at a time)
    const languagesPerPage = 3;
    const totalPages = Math.ceil(languageColumns.length / languagesPerPage);

    // Get current page of languages
    const currentLanguages = languageColumns.slice(
      languagePage * languagesPerPage,
      (languagePage + 1) * languagesPerPage
    );

    const chartData = {
      xAxis: [
        {
          id: "models",
          data: currentLanguages,
          scaleType: "band",
        },
      ],
      series: csvData
        ? csvData.map((rowData, index) => ({
            data: currentLanguages.map((languageKey) => {
              const value = parseFloat(rowData[languageKey]);
              return !isNaN(value) ? value : 0;
            }),
            label: rowData[Object.keys(rowData)[0]], // Use first column (likely model name) as label
            color: `hsl(${(index * 360) / csvData.length}, 70%, 50%)`, // Unique color for each model
          }))
        : [],
    };

    // If no data, log and show error
    if (!csvData || csvData.length === 0 || currentLanguages.length === 0) {
      console.error("No data available for selected languages");
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          minHeight="400px"
          sx={{
            backgroundColor: "#f8f8f8",
            borderRadius: 2,
            p: 2,
            width: "calc(100% - 60px)",
            marginLeft: "30px",
          }}
        >
          <Typography color="error" variant="body1" align="center">
            No data available for the selected languages. Please check your
            selection.
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: "calc(100% - 60px)",
          marginLeft: "30px",
          height: "600px",
          backgroundColor: "#f8f8f8",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Model Performance for Selected Languages
        </Typography>

        <Box sx={{ flex: 1 }}>
          <BarChart
            {...chartData}
            height={450}
            margin={{ left: 80, right: 50, top: 20, bottom: 100 }}
            xAxis={[
              {
                ...chartData.xAxis[0],
                label: "Languages",
                labelStyle: {
                  fontSize: 14,
                  marginTop: 150,
                },
                tickLabelStyle: {
                  angle: -15,
                  textAnchor: "end",
                  fontSize: 10,
                },
              },
            ]}
            yAxis={[
              {
                label: "Performance",
                labelStyle: {
                  fontSize: 14,
                  marginLeft: 50,
                },
                tickLabelStyle: {
                  fontSize: 12,
                },
              },
            ]}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            tooltip={{
              trigger: "item",
            }}
            barWidth={50}
            barGap={0.2}
          />
        </Box>

        {/* Pagination Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeft />}
              onClick={() => setLanguagePage(Math.max(0, languagePage - 1))}
              disabled={languagePage === 0}
            >
              Previous
            </Button>
            <Typography variant="body2">
              Page {languagePage + 1} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ChevronRight />}
              onClick={() =>
                setLanguagePage(Math.min(totalPages - 1, languagePage + 1))
              }
              disabled={languagePage === totalPages - 1}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  // Render graph for model selection
  if (filters.filterType === "model") {
    // Prepare data for BarChart
    const chartData = {
      xAxis: [
        {
          id: "languages",
          data: csvData.map((item) => item.language),
          scaleType: "band",
        },
      ],
      series: [
        {
          data: csvData.map((item) => item.value),
          label: `${filters.filterValue} Performance`,
          color: "#1976d2", // Material-UI primary blue
        },
      ],
    };

    return (
      <Box
        sx={{
          width: "calc(100% - 60px)",
          marginLeft: "30px",
          height: "500px",
          backgroundColor: "#f8f8f8",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {filters.filterValue} Performance Across Languages
        </Typography>

        <Box sx={{ flex: 1 }}>
          <BarChart
            {...chartData}
            height={400}
            margin={{ left: 80, right: 50, top: 20, bottom: 50 }}
            xAxis={[
              {
                ...chartData.xAxis[0],
                label: "Languages",
                labelStyle: {
                  fontSize: 14,
                  marginTop: 150, // Increased margin to move further down
                },
                tickLabelStyle: {
                  angle: -15, // Rotate labels to prevent overlap
                  textAnchor: "end",
                  fontSize: 10,
                },
              },
            ]}
            yAxis={[
              {
                label: "Performance",
                labelStyle: {
                  fontSize: 14,
                  marginLeft: 50, // Increased margin to move further away
                },
                tickLabelStyle: {
                  fontSize: 12,
                },
              },
            ]}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            tooltip={{
              trigger: "item",
            }}
          />
        </Box>
      </Box>
    );
  }

  // Render table for default view
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {filters.dataset} Data
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {Object.keys(csvData[0])
                .filter((col) => !["id", "_id", "timestamp"].includes(col))
                .map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {csvData.map((row, index) => (
              <TableRow key={index}>
                {Object.entries(row)
                  .filter(([key]) => !["id", "_id", "timestamp"].includes(key))
                  .map(([key, value]) => (
                    <TableCell key={key}>
                      {typeof value === "number" || !isNaN(parseFloat(value))
                        ? Number(value).toFixed(4)
                        : value}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TextClassification;
