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
  IconButton,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  ChevronLeft,
  ChevronRight,
  StackedBarChartOutlined,
} from "@mui/icons-material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { getFilename } from "./FileName";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

const TextClassification = ({
  externalTabValue,
  filters,
  showCsvTable = false,
}) => {
  const [csvData, setCsvData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [languagePage, setLanguagePage] = React.useState(0);
  const [groupPage, setGroupPage] = React.useState(0);
  const [resourceGroups, setResourceGroups] = React.useState(null);

  // Ref for chart container
  const chartContainerRef = React.useRef(null);

  // Effect to fetch resource groups
  React.useEffect(() => {
    fetch("/resource_groups.json")
      .then((response) => response.json())
      .then((data) => {
        setResourceGroups(data);
      })
      .catch((error) => {
        console.error("Error fetching resource groups:", error);
        // Provide a default resource group mapping if fetch fails
        setResourceGroups({
          high: ["eng_Latn", "spa_Latn", "fra_Latn"],
          "medium-high": ["deu_Latn", "por_Latn", "ita_Latn"],
          medium: ["nld_Latn", "rus_Cyrl", "ara_Arab"],
          "medium-low": ["tur_Latn", "zho_Hans", "jpn_Jpan"],
          low: ["kor_Hang", "hin_Deva", "ben_Beng"],
        });
      });
  }, []);

  // Effect to fetch CSV data when filters change
  React.useEffect(() => {
    // Reset previous state
    setCsvData(null);
    setIsLoading(false);
    setError(null);
    setLanguagePage(0);

    // Check if we have a dataset to fetch
    if (!filters?.dataset) {
      setError("Please select a dataset");
      return;
    }

    // If we have uploaded model data and this is a model filter, use that instead of fetching
    if (
      filters.uploadedModelData &&
      filters.filterType === "model" &&
      filters.filterValue
    ) {
      const modelData = filters.uploadedModelData[filters.filterValue];
      if (modelData) {
        // Convert the uploaded model data to the format expected by the visualization
        const graphData = Object.entries(modelData)
          .filter(([key]) => key !== "Model" && key !== "Avg") // Exclude non-language columns
          .map(([language, value]) => {
            const parsedValue = parseFloat(value);
            return {
              language,
              value: isNaN(parsedValue) ? 0 : parsedValue, // Ensure we never pass NaN or null
            };
          })
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value);

        if (graphData.length === 0) {
          setError(`No performance data found for ${filters.filterValue}`);
          setIsLoading(false);
          return;
        }

        setCsvData(graphData);
        setIsLoading(false);
        return;
      }
    }

    // If no uploaded data or not a model filter, proceed with normal CSV fetch
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

    // Generate color for each model
    const generateColor = (index, total) => {
      return `hsl(${(index * 360) / total}, 70%, 50%)`;
    };

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
            color: generateColor(index, csvData.length), // Unique color for each model
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

        <Box sx={{ flex: 1, position: "relative" }}>
          <Box
            sx={{
              position: "relative",
              flex: 1,
            }}
            ref={chartContainerRef}
          >
            {/* Download Icon */}
            <IconButton
              onClick={() => {
                try {
                  // Extensive logging for debugging
                  console.log("Download initiated", {
                    chartContainerRef: chartContainerRef.current,
                    csvData: csvData,
                    filters: filters,
                  });

                  // Validate chart container reference
                  if (!chartContainerRef.current) {
                    console.error("Chart container ref is null");
                    alert("Cannot find chart container. Please try again.");
                    return;
                  }

                  // Create a temporary container for capturing
                  const tempContainer = document.createElement("div");
                  tempContainer.style.display = "flex";
                  tempContainer.style.flexDirection = "column";
                  tempContainer.style.alignItems = "center";
                  tempContainer.style.backgroundColor = "white";
                  tempContainer.style.padding = "20px";
                  tempContainer.style.width = "100%";
                  tempContainer.style.maxWidth = "800px";
                  tempContainer.style.margin = "0 auto";

                  // Clone the entire chart container
                  const chartClone = chartContainerRef.current.cloneNode(true);

                  // Remove download icon
                  const iconButtons = chartClone.querySelectorAll("button");
                  iconButtons.forEach((button) => button.remove());

                  // Find and clone the existing legend
                  const existingLegend = chartClone.querySelector(
                    ".MuiChartsLegend-root"
                  );

                  // If existing legend found, add it to the container only for non-model filters
                  if (existingLegend && filters.filterType !== "model") {
                    // Ensure legend is visible and styled appropriately
                    existingLegend.style.display = "flex";
                    existingLegend.style.justifyContent = "center";
                    existingLegend.style.width = "100%";
                    existingLegend.style.marginTop = "10px";

                    // Remove any absolute positioning that might interfere with capture
                    existingLegend.style.position = "static";

                    // Add the existing legend to the temp container
                    tempContainer.appendChild(existingLegend);
                  }

                  // Create legend container
                  const legendContainer = document.createElement("div");
                  legendContainer.style.display = "flex";
                  legendContainer.style.justifyContent = "center";
                  legendContainer.style.alignItems = "center";
                  legendContainer.style.gap = "16px";
                  legendContainer.style.marginTop = "10px";
                  legendContainer.style.flexWrap = "wrap";

                  // Determine legend items based on filter type
                  let legendItems = [];
                  if (filters.filterType === "model") {
                    // Use resource group legend for model filter
                    legendItems = [
                      { name: "HIGH Resource", color: `hsl(0, 70%, 50%)` }, // Red
                      { name: "MEDIUM Resource", color: `hsl(120, 70%, 50%)` }, // Green
                      { name: "LOW Resource", color: `hsl(240, 70%, 50%)` }, // Blue
                    ];
                  } else {
                    // For other filters, use model names from csvData
                    legendItems = csvData.map((rowData, index) => ({
                      name:
                        rowData[Object.keys(rowData)[0]] ||
                        `Model ${index + 1}`,
                      color: `hsl(${(index * 360) / csvData.length}, 70%, 50%)`,
                    }));
                  }

                  // Generate legend items
                  legendItems.forEach((item) => {
                    const legendItem = document.createElement("div");
                    legendItem.style.display = "flex";
                    legendItem.style.alignItems = "center";
                    legendItem.style.gap = "8px";
                    legendItem.style.margin = "0 10px";

                    const colorBox = document.createElement("div");
                    colorBox.style.width = "16px";
                    colorBox.style.height = "16px";
                    colorBox.style.backgroundColor = item.color;

                    const modelText = document.createElement("span");
                    modelText.textContent = item.name;
                    modelText.style.fontSize = "14px";

                    legendItem.appendChild(colorBox);
                    legendItem.appendChild(modelText);
                    legendContainer.appendChild(legendItem);
                  });

                  // Add chart and legend to temp container
                  tempContainer.appendChild(chartClone);
                  tempContainer.appendChild(legendContainer);

                  // Ensure the container is in the document for html2canvas
                  document.body.appendChild(tempContainer);

                  // Capture the entire container
                  html2canvas(tempContainer, {
                    scale: 3, // Increase resolution
                    useCORS: true, // Handle cross-origin images
                    logging: true, // Enable logging for debugging
                    allowTaint: true, // Allow drawing images from different origins
                    backgroundColor: "#ffffff", // Ensure white background
                  })
                    .then((canvas) => {
                      // Remove temporary container
                      document.body.removeChild(tempContainer);

                      canvas.toBlob(function (blob) {
                        // Determine filename based on current view
                        const filename =
                          filters.filterType === "model"
                            ? `${filters.filterValue}_${currentLanguages.join(
                                "_"
                              )}_performance_graph.png`
                            : `${filters.filterValue}_performance_graph.png`;

                        saveAs(blob, filename);
                      });
                    })
                    .catch((error) => {
                      // Remove temporary container in case of error
                      if (tempContainer.parentNode) {
                        document.body.removeChild(tempContainer);
                      }
                      console.error("html2canvas Error:", error);
                      alert(`Failed to download graph: ${error.message}`);
                    });
                } catch (error) {
                  console.error("Download Capture Error:", error);
                  alert(`Failed to download graph: ${error.message}`);
                }
              }}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 10,
              }}
            >
              <DownloadIcon />
            </IconButton>

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
                  hidden: true, // Hide the built-in legend
                },
              }}
              tooltip={{
                trigger: "item",
              }}
              barWidth={50}
              barGap={0.2}
            />
          </Box>

          {/* Model Legend */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 1, // Reduced from mt: 2
              flexWrap: "wrap",
            }}
          >
            {csvData.map((rowData, index) => {
              const modelName = rowData[Object.keys(rowData)[0]];
              const color = generateColor(index, csvData.length);

              return (
                <Box
                  key={modelName}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: color,
                    }}
                  />
                  <Typography variant="body2">{modelName}</Typography>
                </Box>
              );
            })}
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
      </Box>
    );
  }

  // Render graph for model selection
  if (filters.filterType === "model") {
    // Debug logging
    console.log("Model Filter Data:", {
      csvData,
      resourceGroups,
      filters,
    });

    // Ensure we have data to work with
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
          <Typography color="error" variant="body1" align="center">
            No data available for the selected model. Please check your
            selection.
          </Typography>
        </Box>
      );
    }

    // Ensure resource groups are loaded
    if (!resourceGroups) {
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

    // Define color mapping for resource groups
    const RESOURCE_GROUP_COLORS = {
      high: "#0d47a1", // Dark blue
      "medium-high": "#1976d2", // Medium-dark blue
      medium: "#2196f3", // Medium blue
      "medium-low": "#64b5f6", // Light blue
      low: "#bbdefb",
      unseen: "#E3F2FD", // Very light blue
    };

    // Define a custom sorting order for resource groups
    const RESOURCE_GROUP_ORDER = [
      "high",
      "medium-high",
      "medium",
      "medium-low",
      "low",
      "unseen",
    ];

    // Categorize languages by resource group
    const languagesByGroup = Object.keys(resourceGroups).reduce(
      (acc, group) => {
        acc[group] = csvData.filter((item) =>
          resourceGroups[group].includes(item.language)
        );
        return acc;
      },
      {}
    );

    // Debug logging for language categorization
    console.log("Languages By Group:", languagesByGroup);

    // Filter out empty groups and sort them according to the predefined order
    const nonEmptyGroups = Object.keys(languagesByGroup)
      .filter((group) => languagesByGroup[group].length > 0)
      .sort((a, b) => {
        const indexA = RESOURCE_GROUP_ORDER.indexOf(a);
        const indexB = RESOURCE_GROUP_ORDER.indexOf(b);
        return indexA - indexB;
      });

    // Debug logging for non-empty groups
    console.log("Non-Empty Groups:", nonEmptyGroups);

    // Total group pages
    const totalGroupPages = nonEmptyGroups.length;

    // Ensure groupPage is within bounds
    const safeGroupPage = Math.min(Math.max(groupPage, 0), totalGroupPages - 1);

    // Handle case when no groups have data
    if (nonEmptyGroups.length === 0) {
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
            No languages found in any resource group for the selected model.
          </Typography>
        </Box>
      );
    }

    // Get current group
    const currentGroup = nonEmptyGroups[safeGroupPage];
    const currentGroupData = languagesByGroup[currentGroup];

    // Debug logging for current group
    console.log("Current Group:", {
      group: currentGroup,
      data: currentGroupData,
    });

    // Ensure current group has data
    if (!currentGroupData || currentGroupData.length === 0) {
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
            No data found for the current resource group.
          </Typography>
        </Box>
      );
    }

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {filters.filterValue} Performance -{" "}
            {currentGroup === "unseen"
              ? "UNSEEN"
              : currentGroup.replace("-", " ").toUpperCase() + " Resource"}
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            flex: 1,
          }}
          ref={chartContainerRef}
        >
          {/* Download Icon */}
          <IconButton
            onClick={() => {
              try {
                // Extensive logging for debugging
                console.log("Download initiated", {
                  chartContainerRef: chartContainerRef.current,
                  csvData: csvData,
                  filters: filters,
                });

                // Validate chart container reference
                if (!chartContainerRef.current) {
                  console.error("Chart container ref is null");
                  alert("Cannot find chart container. Please try again.");
                  return;
                }

                // Create a temporary container for capturing
                const tempContainer = document.createElement("div");
                tempContainer.style.display = "flex";
                tempContainer.style.flexDirection = "column";
                tempContainer.style.alignItems = "center";
                tempContainer.style.backgroundColor = "white";
                tempContainer.style.padding = "20px";
                tempContainer.style.width = "100%";
                tempContainer.style.maxWidth = "800px";
                tempContainer.style.margin = "0 auto";

                // Clone the entire chart container
                const chartClone = chartContainerRef.current.cloneNode(true);

                // Remove download icon
                const iconButtons = chartClone.querySelectorAll("button");
                iconButtons.forEach((button) => button.remove());

                // Find and clone the existing legend
                const existingLegend = chartClone.querySelector(
                  ".MuiChartsLegend-root"
                );

                // If existing legend found, add it to the container only for non-model filters
                if (existingLegend && filters.filterType !== "model") {
                  // Ensure legend is visible and styled appropriately
                  existingLegend.style.display = "flex";
                  existingLegend.style.justifyContent = "center";
                  existingLegend.style.width = "100%";
                  existingLegend.style.marginTop = "10px";

                  // Remove any absolute positioning that might interfere with capture
                  existingLegend.style.position = "static";

                  // Add the existing legend to the temp container
                  tempContainer.appendChild(existingLegend);
                }

                // Create legend container
                const legendContainer = document.createElement("div");
                legendContainer.style.display = "flex";
                legendContainer.style.justifyContent = "center";
                legendContainer.style.alignItems = "center";
                legendContainer.style.gap = "16px";
                legendContainer.style.marginTop = "10px";
                legendContainer.style.flexWrap = "wrap";

                // Determine legend items based on filter type
                let legendItems = [];
                if (filters.filterType === "model") {
                  // Use resource group legend for model filter
                  legendItems = [
                    { name: "High", color: RESOURCE_GROUP_COLORS["high"] },
                    {
                      name: "Medium-High",
                      color: RESOURCE_GROUP_COLORS["medium-high"],
                    },
                    { name: "Medium", color: RESOURCE_GROUP_COLORS["medium"] },
                    {
                      name: "Medium-Low",
                      color: RESOURCE_GROUP_COLORS["medium-low"],
                    },
                    { name: "Low", color: RESOURCE_GROUP_COLORS["low"] },
                    { name: "Unseen", color: RESOURCE_GROUP_COLORS["unseen"] },
                  ];
                } else {
                  // For other filters, use model names from csvData
                  legendItems = csvData.map((rowData, index) => ({
                    name:
                      rowData[Object.keys(rowData)[0]] || `Model ${index + 1}`,
                    color: `hsl(${(index * 360) / csvData.length}, 70%, 50%)`,
                  }));
                }

                // Generate legend items
                legendItems.forEach((item) => {
                  const legendItem = document.createElement("div");
                  legendItem.style.display = "flex";
                  legendItem.style.alignItems = "center";
                  legendItem.style.gap = "8px";
                  legendItem.style.margin = "0 10px";

                  const colorBox = document.createElement("div");
                  colorBox.style.width = "16px";
                  colorBox.style.height = "16px";
                  colorBox.style.backgroundColor = item.color;

                  const modelText = document.createElement("span");
                  modelText.textContent = item.name;
                  modelText.style.fontSize = "14px";

                  legendItem.appendChild(colorBox);
                  legendItem.appendChild(modelText);
                  legendContainer.appendChild(legendItem);
                });

                // Add chart and legend to temp container
                tempContainer.appendChild(chartClone);
                tempContainer.appendChild(legendContainer);

                // Ensure the container is in the document for html2canvas
                document.body.appendChild(tempContainer);

                // Capture the entire container
                html2canvas(tempContainer, {
                  scale: 3, // Increase resolution
                  useCORS: true, // Handle cross-origin images
                  logging: true, // Enable logging for debugging
                  allowTaint: true, // Allow drawing images from different origins
                  backgroundColor: "#ffffff", // Ensure white background
                })
                  .then((canvas) => {
                    // Remove temporary container
                    document.body.removeChild(tempContainer);

                    canvas.toBlob(function (blob) {
                      // Determine filename based on current view
                      const filename =
                        filters.filterType === "model"
                          ? `${filters.filterValue}_${currentGroup}_performance_graph.png`
                          : `${filters.filterValue}_performance_graph.png`;

                      saveAs(blob, filename);
                    });
                  })
                  .catch((error) => {
                    // Remove temporary container in case of error
                    if (tempContainer.parentNode) {
                      document.body.removeChild(tempContainer);
                    }
                    console.error("html2canvas Error:", error);
                    alert(`Failed to download graph: ${error.message}`);
                  });
              } catch (error) {
                console.error("Download Capture Error:", error);
                alert(`Failed to download graph: ${error.message}`);
              }
            }}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <DownloadIcon />
          </IconButton>

          <BarChart
            dataset={currentGroupData}
            series={[
              {
                dataKey: "value",
                label: "Performance",
                valueFormatter: (value) => {
                  // Handle null, undefined, or NaN values
                  if (value === null || value === undefined || isNaN(value)) {
                    return "0.00";
                  }
                  return value.toFixed(2);
                },
              },
            ]}
            colors={[RESOURCE_GROUP_COLORS[currentGroup] || "#1976d2"]}
            height={400}
            margin={{ left: 80, right: 50, top: 20, bottom: 50 }}
            barWidth={20}
            barGap={1}
            xAxis={[
              {
                dataKey: "language",
                scaleType: "band",
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
              tooltip: {
                trigger: "item",
                formatter: (params) => {
                  const { dataIndex } = params;
                  const { language, value } = currentGroupData[dataIndex];
                  const formattedValue =
                    value === null || value === undefined || isNaN(value)
                      ? "0.00"
                      : value.toFixed(2);

                  return `
                    <b>Language:</b> ${language}<br/>
                    <b>Performance:</b> ${formattedValue}<br/>
                    <b>Resource Group:</b> ${currentGroup}
                  `;
                },
              },
            }}
          />
        </Box>

        {/* Resource Group Legend */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor:
                  RESOURCE_GROUP_COLORS[currentGroup] || "#1976d2",
                mr: 1,
              }}
            />
            <Typography variant="caption">
              {currentGroup === "unseen"
                ? "UNSEEN"
                : currentGroup.replace("-", " ").toUpperCase() +
                  " Resource Group"}
            </Typography>
          </Box>
        </Box>

        {/* Pagination Controls for Resource Groups */}
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
              onClick={() => setGroupPage(Math.max(0, groupPage - 1))}
              disabled={groupPage === 0}
            >
              Previous Group
            </Button>
            <Typography variant="body2">
              Group {groupPage + 1} of {totalGroupPages}
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ChevronRight />}
              onClick={() => {
                setGroupPage(Math.min(totalGroupPages - 1, groupPage + 1));
              }}
              disabled={groupPage === totalGroupPages - 1}
            >
              Next Group
            </Button>
          </Stack>
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
