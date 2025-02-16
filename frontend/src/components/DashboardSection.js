import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import api from "../services/api";

import DataTable from "./DataTable";
import FeedbackSidebar from "./FeedbackSidebar";
import CommentSection from "./CommentSection";

function Dashboard({ user, task, benchmark, model }) {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshCommentsFlag, setRefreshCommentsFlag] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
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

  const handleRowSelect = (row) => {
    if (!user) {
      setSnackbarOpen(true);
      return;
    }
    setSelectedRow(row);
    setSidebarOpen(true);
  };

  const handleCommentSubmit = () => {
    setSidebarOpen(false);
    setSelectedRow(null);
    setRefreshCommentsFlag((prev) => !prev);
  };

  // Define column order based on task type.
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

  return (
    <Box sx={{ position: "relative" }}>
      {sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backdropFilter: "blur(3px)",
            zIndex: 1,
          }}
        />
      )}
      <Typography variant="h6" sx={{ my: 2 }}>
        Select a language to view the output results
      </Typography>
      <FormControl fullWidth sx={{ my: 2 }}>
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
      <Button variant="contained" sx={{ my: 2 }} onClick={handleLoadData}>
        Load Data
      </Button>
      <DataTable
        data={tableData}
        onRowSelect={handleRowSelect}
        taskType={taskKey}
        columnOrder={columnOrder}
      />
      {sidebarOpen && selectedRow && user && (
        <FeedbackSidebar
          row={selectedRow}
          taskType={task}
          onClose={() => setSidebarOpen(false)}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
      {/* <CommentSection refreshFlag={refreshCommentsFlag} /> */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Please login before providing feedback."
      />
    </Box>
  );
}

export default Dashboard;
