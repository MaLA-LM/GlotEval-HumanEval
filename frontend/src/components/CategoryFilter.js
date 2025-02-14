import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function CategoryFilter({ data, columnOrder, onFilterChange }) {
  // Check if the data contains the columns for predicted and correct categories
  const hasPredictedCategory = columnOrder.includes("predicted_category");
  const hasCorrectCategory = columnOrder.includes("correct_category");

  const getUniqueValues = (key) => [...new Set(data.map((row) => row[key]))];

  const predictedOptions = hasPredictedCategory
    ? getUniqueValues("predicted_category")
    : [];
  const correctOptions = hasCorrectCategory
    ? getUniqueValues("correct_category")
    : [];

  const [selectedPredicted, setSelectedPredicted] = useState("");
  const [selectedCorrect, setSelectedCorrect] = useState("");

  useEffect(() => {
    onFilterChange({ predicted: selectedPredicted, correct: selectedCorrect });
  }, [selectedPredicted, selectedCorrect, onFilterChange]);

  return (
    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      {/* Filter for predicted category */}
      {hasPredictedCategory && (
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel shrink={true}>Filter by Predicted Category</InputLabel>
          <Select
            value={selectedPredicted}
            onChange={(e) => setSelectedPredicted(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            {predictedOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Filter for correct category */}
      {hasCorrectCategory && (
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel shrink={true}>Filter by Correct Category</InputLabel>
          <Select
            value={selectedCorrect}
            onChange={(e) => setSelectedCorrect(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            {correctOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
}

export default CategoryFilter;
