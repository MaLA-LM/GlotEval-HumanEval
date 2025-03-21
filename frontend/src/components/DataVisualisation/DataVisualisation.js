import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import TextClassification from "./TextClassification";
import Sidebar from "./Sidebar";
import DashboardSection from "../OutputBoardSection";
import AnalyticsSidebar from "./AnalyticsSidebar";
const DataVisualisation = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const taskOptions = {
    0: {
      dataset: ["SIB-200", "Taxi-1500"],
      metric: ["accuracy"],
    },
    1: {
      dataset: ["Flores200 Eng-X", "Flores200 X-Eng"],
      metric: ["BLEU", "chrF"],
    },
    2: {
      dataset: ["XLSum"],
      metric: ["BERTScore", "ROUGE"],
    },
    3: {
      dataset: ["Aya", "Aya (Self BLEU)", "PolyWrite"],
      metric: ["BLEU"],
    },
    4: {
      dataset: ["BELEBELE", "arc_multilingual"],
      metric: ["accuracy"],
    },
    5: {
      dataset: ["glot500", "pbc"],
      metric: ["NLL"],
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

  const task = {
    0: "Classification",
    1: "Translation",
    2: "Summarization",
    3: "Generation",
    4: "Comprehension",
    5: "Evaluation",
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
      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        <Box sx={{ width: 300, mr: 2 }}>
          <Sidebar
            onComplete={handleFiltersComplete}
            selectedTab={selectedTab}
            taskOptions={taskOptions}
          />
        </Box>

        {/* Main content */}
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
        >
          {filters && (
            <TextClassification
              externalTabValue={selectedTab}
              filters={filters}
              sx={{ flexGrow: 1 }}
            />
          )}

          <Divider sx={{ margin: "10px 0" }} />
          {/* Error analysis section (include human evaluation) */}
          {filters && filters.filterType === "model" && (
            <Box sx={{ marginTop: "-60px" }}>
              <DashboardSection
                task={task[selectedTab]}
                benchmark={filters.dataset}
                model={filters.filterValue}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DataVisualisation;
