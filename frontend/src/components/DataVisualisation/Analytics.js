import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextClassification from "./TextClassification";
import AnalyticsSidebar from "./AnalyticsSidebar";

const Analytics = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const taskOptions = {
    0: {
      dataset: ["SIB-200", "Taxi-1500"],
    },
    1: {
      dataset: ["Flores200 Eng-X", "Flores200 X-Eng"],
    },
    2: {
      dataset: ["XLSum"],
    },
    3: {
      dataset: ["Aya", "Aya-Self", "PolyWrite"],
    },
    4: {
      dataset: ["BELEBELE", "arc_multilingual"],
    },
    5: {
      dataset: ["glot500", "pbc"],
    },
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setFilters(null); // Reset filters when changing tabs
  };

  const handleFiltersComplete = (newFilters) => {
    setFilters(newFilters);
  };

  const handleMetricsUpdate = (newMetrics) => {
    setMetrics(newMetrics);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Tabs on top */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Text Classification" />
          <Tab label="Machine Translation" />
          <Tab label="Text Summarization" />
          <Tab label="Open-ended Chat" />
          <Tab label="Machine Comprehension" />
          <Tab label="Intrinsic Evaluation" />
        </Tabs>
      </Box>

      {/* Main content area */}
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 150px)' }}>
        {/* Sidebar */}
        <Grid item xs={3} sx={{ height: '100%' }}>
          <AnalyticsSidebar 
            onComplete={handleFiltersComplete} 
            selectedTab={selectedTab}
            taskOptions={taskOptions}
            onMetricsUpdate={handleMetricsUpdate}
          />
        </Grid>

        {/* Metrics Display */}
        {metrics && (
          <Grid item xs={metrics ? 9 : 3} sx={{ height: '100%' }}>
            <Paper 
              sx={{ 
                p: 2, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                overflowY: 'auto' 
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Metrics Overview</Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1, 
                flexGrow: 1, 
                overflowY: 'auto' 
              }}>
                <Typography>Precision: {metrics.precision}</Typography>
                <Typography>Recall: {metrics.recall}</Typography>
                <Typography>F1-Score: {metrics.f1Score}</Typography>
                <Typography>Accuracy: {metrics.accuracy}</Typography>
              </Box>

              {/* Detailed Breakdown */}
              {metrics.details && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Detailed Breakdown</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Total Lines</TableCell>
                          <TableCell>Processed Lines</TableCell>
                          <TableCell>Matched Lines</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{metrics.details.totalLines}</TableCell>
                          <TableCell>{metrics.details.processedLines}</TableCell>
                          <TableCell>{metrics.details.matchedLines}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Top Similarities */}
              {metrics.details && metrics.details.topSimilarities && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Top Similarities</Typography>
                  <TableContainer sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Line</TableCell>
                          <TableCell>Similarity</TableCell>
                          <TableCell>Match</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.details.topSimilarities.map((entry, index) => (
                          <TableRow 
                            key={index} 
                            sx={{ 
                              backgroundColor: entry.isMatch 
                                ? 'rgba(0, 255, 0, 0.1)' 
                                : 'rgba(255, 0, 0, 0.1)' 
                            }}
                          >
                            <TableCell>{entry.lineNumber}</TableCell>
                            <TableCell>{(entry.similarity * 100).toFixed(2)}%</TableCell>
                            <TableCell>{entry.isMatch ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Error Handling */}
              {metrics.error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  Error: {metrics.error}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Main Content */}
        {filters && (
          <Grid item xs={metrics ? 0 : 9} sx={{ height: '100%' }}>
            <TextClassification 
              externalTabValue={selectedTab} 
              filters={filters} 
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Analytics;
