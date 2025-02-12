import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function TaskSelector({
  tasksConfig,
  selectedTask,
  setSelectedTask,
  selectedBenchmark,
  setSelectedBenchmark,
  selectedModel,
  setSelectedModel,
  selectedLanguage,
  setSelectedLanguage,
}) {
  // Handle task selection change
  const handleTaskChange = (e) => {
    setSelectedTask(e.target.value);
    // Reset dependent dropdowns
    setSelectedBenchmark("");
    setSelectedModel("");
    setSelectedLanguage("");
  };

  // If tasksConfig is not yet loaded or empty, show a loading message.
  if (!tasksConfig || Object.keys(tasksConfig).length === 0) {
    return <div>Loading tasks...</div>;
  }

  // Get the list of tasks (keys of tasksConfig)
  const taskKeys = Object.keys(tasksConfig);

  // // Get benchmarks array from the selected task, or an empty array if not available.
  // const benchmarks =
  //   selectedTask && tasksConfig[selectedTask].benchmarks
  //     ? tasksConfig[selectedTask].benchmarks
  //     : [];

  // // Get models for the selected task and benchmark.
  // const models =
  //   selectedTask &&
  //   selectedBenchmark &&
  //   tasksConfig[selectedTask].models &&
  //   tasksConfig[selectedTask].models[selectedBenchmark]
  //     ? Object.keys(tasksConfig[selectedTask].models[selectedBenchmark])
  //     : [];

  // // Get languages for the selected task, benchmark, and model.
  // const languages =
  // selectedTask &&
  // selectedBenchmark &&
  // selectedModel &&
  // tasksConfig[selectedTask].models &&
  // tasksConfig[selectedTask].models[selectedBenchmark] &&
  // tasksConfig[selectedTask].models[selectedBenchmark][selectedModel] &&
  // tasksConfig[selectedTask].models[selectedBenchmark][selectedModel].languages
  //   ? tasksConfig[selectedTask].models[selectedBenchmark][selectedModel].languages
  //   : [];
  // Get benchmarks array from the selected task, or an empty array if not available.
  const benchmarks = Object.keys(tasksConfig[selectedTask] ?? {});

  // Get models for the selected task and benchmark.
  const models = Object.keys(
    tasksConfig[selectedTask]?.[selectedBenchmark] ?? {}
  );

  // Get languages for the selected task, benchmark, and model.
  const languages =
    tasksConfig[selectedTask]?.[selectedBenchmark]?.[selectedModel] ?? [];

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Task</InputLabel>
        <Select value={selectedTask} label="Task" onChange={handleTaskChange}>
          {taskKeys.map((task) => (
            <MenuItem key={task} value={task}>
              {task}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }} disabled={!selectedTask}>
        <InputLabel>Benchmark</InputLabel>
        <Select
          value={selectedBenchmark}
          label="Benchmark"
          onChange={(e) => {
            setSelectedBenchmark(e.target.value);
            // Reset model and language when benchmark changes
            setSelectedModel("");
            setSelectedLanguage("");
          }}
        >
          {benchmarks.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }} disabled={!selectedBenchmark}>
        <InputLabel>Model</InputLabel>
        <Select
          value={selectedModel}
          label="Model"
          onChange={(e) => {
            setSelectedModel(e.target.value);
            // Reset language when model changes
            setSelectedLanguage("");
          }}
        >
          {models.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }} disabled={!selectedModel}>
        <InputLabel>Language</InputLabel>
        <Select
          value={selectedLanguage}
          label="Language"
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default TaskSelector;
