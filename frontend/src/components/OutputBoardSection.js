import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import DataTable from "./DataTable";

function Dashboard({ task, benchmark, model }) {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tableData, setTableData] = useState([]);

  const [availableLanguages, setAvailableLanguages] = useState([]);

  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/api/tasks");
        // setTasksConfig(res.data);

        if (
          res.data[task] &&
          res.data[task][benchmark] &&
          res.data[task][benchmark][model]
        ) {
          setAvailableLanguages(res.data[task][benchmark][model] || []);
        } else {
          setAvailableLanguages([]);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    // Hide the table when any of the dropdown selections change.
    setTableData([]);
  }, [selectedLanguage]);
  // Load data when task, benchmark, model, and language are selected.
  useEffect(() => {
    if (selectedLanguage) {
      handleLoadData();
    }
  }, [selectedLanguage]);
  const handleLoadData = async () => {
    if (!selectedLanguage) {
      alert("Please select a language.");
      return;
    }
    try {
      const res = await api.post("/api/data", {
        task,
        benchmark,
        model,
        language: selectedLanguage,
      });
      setTableData(res.data);
    } catch (error) {
      console.error(
        "Error loading data:",
        error.response?.data || error.message
      );
      alert(
        "Error loading data: " + (error.response?.data?.error || error.message)
      );
    }
  };

  let columnOrder = [];
  const taskKey = task.toLowerCase();
  if (taskKey === "classification") {
    columnOrder = [
      "model_name",
      "test_lang",
      "prompt",
      "predicted_category",
      "correct_category",
    ];
  } else if (taskKey === "translation") {
    columnOrder = [
      "model_name",
      "src_lang",
      "tgt_lang",
      "src_text",
      "ref_text",
      "hyp_text",
      "prompt",
    ];
  } else if (taskKey === "generation" || taskKey === "summarization") {
    columnOrder = ["model_name", "input", "target", "output"];
  } else if (tableData.length > 0) {
    columnOrder = Object.keys(tableData[0]);
  }

  const handleNavigateToHumanFeedback = () => {
    if (!selectedLanguage) {
      alert("Please select a language before proceeding to Human Feedback.");
      return;
    }
    navigate(
      `/human-feedback?task=${task}&benchmark=${benchmark}&model=${model}&language=${selectedLanguage}`
    );
  };
  return (
    <Box sx={{ position: "relative" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Select a language to view the output results
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          my: 2,
          width: "100%",
        }}
      >
        <FormControl sx={{ flex: 1, minWidth: 200, maxWidth: 800 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {availableLanguages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          sx={{ my: 2 }}
          color="secondary"
          onClick={handleNavigateToHumanFeedback}
        >
          Go To Human Feedback
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}></Box>
      <DataTable
        data={tableData}
        onRowSelect={null}
        taskType={taskKey}
        columnOrder={columnOrder}
        isViewMode={true}
      />
    </Box>
  );
}

export default Dashboard;
