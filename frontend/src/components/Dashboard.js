import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Snackbar } from "@mui/material";
import api from "../services/api";
import TaskSelector from "./TaskSelector";
import DataTable from "./DataTable";
import FeedbackSidebar from "./FeedbackSidebar";
import CommentSection from "./CommentSection";

function Dashboard({ user }) {
  const [tasksConfig, setTasksConfig] = useState({});
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedBenchmark, setSelectedBenchmark] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshCommentsFlag, setRefreshCommentsFlag] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/api/tasks");
        setTasksConfig(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();

    // Clear selections on unload.
    const handleBeforeUnload = () => {
      setSelectedTask("");
      setSelectedBenchmark("");
      setSelectedModel("");
      setSelectedLanguage("");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Hide table when dropdowns change.
  useEffect(() => {
    setTableData([]);
  }, [selectedTask, selectedBenchmark, selectedModel, selectedLanguage]);

  const handleLoadData = async () => {
    if (
      !selectedTask ||
      !selectedBenchmark ||
      !selectedModel ||
      !selectedLanguage
    ) {
      alert("Please select a task, benchmark, model, and language.");
      return;
    }
    try {
      const res = await api.post("/api/data", {
        task: selectedTask,
        benchmark: selectedBenchmark,
        model: selectedModel,
        language: selectedLanguage,
      });
      setTableData(res.data);
    } catch (error) {
      console.error(
        "Error loading data:",
        error.response?.data || error.message
      );
      alert(
        "Error loading data: " +
          (error.response?.data?.error || error.message)
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
  const taskKey = selectedTask.toLowerCase();
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
      <Typography variant="h4" sx={{ my: 2 }}>
        Human Feedback
      </Typography>
      <TaskSelector
        tasksConfig={tasksConfig}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        selectedBenchmark={selectedBenchmark}
        setSelectedBenchmark={setSelectedBenchmark}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
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
          taskType={selectedTask}
          onClose={() => setSidebarOpen(false)}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
      <CommentSection refreshFlag={refreshCommentsFlag} />
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
