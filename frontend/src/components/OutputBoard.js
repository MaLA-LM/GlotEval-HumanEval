import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Drawer,
  Alert,
} from "@mui/material";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import TaskSelector from "./TaskSelector";
import DataTable from "./DataTable";
import FeedbackSidebar from "./FeedbackSidebar";
import CommentSection from "./CommentSection";
import CloseIcon from "@mui/icons-material/Close";

function Dashboard({ user }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location object
  const searchParams = new URLSearchParams(location.search); // Create a URLSearchParams object from the search string

  // Handle the parameters from the URL
  const taskFromURL = searchParams.get("task") || "";
  const benchmarkFromURL = searchParams.get("benchmark") || "";
  const modelFromURL = searchParams.get("model") || "";
  const languageFromURL = searchParams.get("language") || "";

  const [tasksConfig, setTasksConfig] = useState({});
  const [selectedTask, setSelectedTask] = useState(taskFromURL);
  const [selectedBenchmark, setSelectedBenchmark] = useState(benchmarkFromURL);
  const [selectedModel, setSelectedModel] = useState(modelFromURL);
  const [selectedLanguage, setSelectedLanguage] = useState(languageFromURL);
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshCommentsFlag, setRefreshCommentsFlag] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userFeedback, setUserFeedback] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

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
    // const handleBeforeUnload = () => {
    //   setSelectedTask("");
    //   setSelectedBenchmark("");
    //   setSelectedModel("");
    //   setSelectedLanguage("");
    // };
    // window.addEventListener("beforeunload", handleBeforeUnload);
    // return () => {
    //   window.removeEventListener("beforeunload", handleBeforeUnload);
    // };
  }, []);

  // Hide table when dropdowns change.
  useEffect(() => {
    setTableData([]);
  }, [selectedTask, selectedBenchmark, selectedModel, selectedLanguage]);
  // Load data when task, benchmark, model, and language are selected.
  useEffect(() => {
    const params = new URLSearchParams();
    if (
      selectedTask &&
      selectedBenchmark &&
      selectedModel &&
      selectedLanguage
    ) {
      handleLoadData();
      params.set("task", selectedTask);
      params.set("benchmark", selectedBenchmark);
      params.set("model", selectedModel);
      params.set("language", selectedLanguage);

      navigate({ search: params.toString() }, { replace: true });
    }
  }, [
    selectedTask,
    selectedBenchmark,
    selectedModel,
    selectedLanguage,
    navigate,
  ]);
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
        "Error loading data: " + (error.response?.data?.error || error.message)
      );
    }
  };

  const handleRowSelect = (row) => {
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

  // Add this new function to fetch existing feedback
  const checkExistingFeedback = async (rowData) => {
    if (!rowData?.entry_id || !user) {
      console.log("Missing required data:", { rowData, user });
      setUserFeedback(null);
      return;
    }

    try {
      const res = await api.post(`/api/feedback`, {
        entry_id: rowData.entry_id,
        username: user,
      });

      setUserFeedback(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching feedback:", err);
      }
      setUserFeedback(null);
    }
  };

  // Update handleEvaluateOneByOne
  const handleEvaluateOneByOne = () => {
    if (tableData.length > 0) {
      setCurrentIndex(0);
      if (user) {
        checkExistingFeedback(tableData[0]);
      } else {
        setUserFeedback(null);
      }
      setDialogOpen(true);
    }
  };

  // Update navigation handlers
  const handleNext = () => {
    if (currentIndex < tableData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      checkExistingFeedback(tableData[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      checkExistingFeedback(tableData[currentIndex - 1]);
    }
  };

  const handleSkipTo = () => {
    const skipIndex = prompt(
      "Enter entry number to skip to (1-" + tableData.length + "):"
    );
    const index = parseInt(skipIndex) - 1;
    if (!isNaN(index) && index >= 0 && index < tableData.length) {
      setCurrentIndex(index);
      checkExistingFeedback(tableData[index]);
    }
  };

  const handleEvaluateClick = () => {
    if (!tableData || tableData.length === 0) {
      setSnackbarMessage("Please load table data first by selecting task, benchmark, model, and language.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    // Start evaluation from the beginning
    setCurrentIndex(0);
    // Only check for existing feedback if user is logged in
    if (user) {
      checkExistingFeedback(tableData[0]);
    } else {
      setUserFeedback(null);
    }
    setDialogOpen(true);
  };

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
      <Box sx={{ display: "flex", gap: 2, my: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleEvaluateClick}
          disabled={!tableData || tableData.length === 0}
        >
          Evaluate 1-by-1
        </Button>
      </Box>
      {tableData.length > 0 && (
        <DataTable
          data={tableData}
          onRowSelect={handleRowSelect}
          taskType={taskKey}
          columnOrder={columnOrder}
        />
      )}

      {/* Add the evaluation dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>
            Evaluate 1-by-1 (Entry {currentIndex + 1} of {tableData.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={handleSkipTo}>Skip To</Button>
            <Button onClick={handleBack} disabled={currentIndex === 0}>
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === tableData.length - 1}
            >
              Next
            </Button>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {userFeedback && (
            <Typography color="warning.main" sx={{ mb: 2 }}>
              You have already provided feedback for this entry: "
              {userFeedback.comment}"
            </Typography>
          )}
          {dialogOpen && tableData[currentIndex] && (
            <FeedbackSidebar
              row={tableData[currentIndex]}
              taskType={selectedTask}
              onClose={() => setDialogOpen(false)}
              onCommentSubmit={() => {
                handleCommentSubmit();
                handleNext();
              }}
              isDialog={true}
              key={currentIndex}
              userFeedback={userFeedback}
              user={user}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modify the feedback sidebar section */}
      {selectedRow && !dialogOpen && (
        <Drawer
          anchor="right"
          open={Boolean(selectedRow)}
          onClose={() => setSelectedRow(null)}
          PaperProps={{
            sx: {
              width: "50%",
              "& > *": {
                // This ensures children take full width
                width: "100%",
              },
            },
          }}
        >
          <FeedbackSidebar
            row={selectedRow}
            taskType={selectedTask}
            onClose={() => setSelectedRow(null)}
            onCommentSubmit={handleCommentSubmit}
            isDialog={false}
            user={user}
          />
        </Drawer>
      )}

      <CommentSection refreshFlag={refreshCommentsFlag} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
