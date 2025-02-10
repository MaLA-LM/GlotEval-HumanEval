// src/components/TextHighlighter.js
import React, { useState, useRef } from "react";
import { Box, Button, List, ListItem, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// Map error types to colors (customize as needed)
const errorColors = {
  "Grammar Error": "#ffcccc",
  "Spelling or Typographical Error": "#d1e7dd",
  "Incoherent or Illogical": "#fff3cd",
  "Off-topic or Irrelevant": "#cfe2ff",
  "Redundancy": "#e2e3e5",
  "Ambiguity or Vagueness": "#f8d7da",
  "Cultural Sensitivity or Offensive Content": "#f5c2c7",
};

const intervalsOverlap = (a, b) => a.start <= b.end && b.start <= a.end;
const mergeIntervals = (a, b) => ({
  start: Math.min(a.start, b.start),
  end: Math.max(a.end, b.end),
  errorType: a.errorType, // assume same error type
});

function TextHighlighter({ text, errorType, onHighlightChange }) {
  const textRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    // Ensure selection is inside our text container.
    if (!textRef.current.contains(selection.anchorNode)) return;

    const fullText = textRef.current.innerText;
    const selectedText = selection.toString();
    const start = fullText.indexOf(selectedText);
    if (start === -1) return;
    const end = start + selectedText.length;
    const newAnnotation = { start, end, errorType };

    // Merge overlapping annotations if same error type.
    let mergedAnnotation = newAnnotation;
    const remaining = [];
    annotations.forEach((ann) => {
      if (ann.errorType === errorType && intervalsOverlap(ann, mergedAnnotation)) {
        mergedAnnotation = mergeIntervals(ann, mergedAnnotation);
      } else {
        remaining.push(ann);
      }
    });
    const updatedAnnotations = [...remaining, mergedAnnotation];
    updatedAnnotations.sort((a, b) => a.start - b.start);
    setAnnotations(updatedAnnotations);
    if (onHighlightChange) onHighlightChange(updatedAnnotations);
    selection.removeAllRanges();
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    if (onHighlightChange) onHighlightChange([]);
  };

  // Render the text with annotations highlighted.
  const getHighlightedText = () => {
    if (annotations.length === 0) return text;
    let segments = [];
    let lastIndex = 0;
    annotations.forEach((ann, idx) => {
      if (ann.start > lastIndex) {
        segments.push(text.slice(lastIndex, ann.start));
      }
      segments.push(
        <span key={idx} style={{ backgroundColor: errorColors[ann.errorType] || "#ffff99" }}>
          {text.slice(ann.start, ann.end)}
        </span>
      );
      lastIndex = ann.end;
    });
    if (lastIndex < text.length) {
      segments.push(text.slice(lastIndex));
    }
    return segments;
  };

  return (
    <Box>
      <Box
        ref={textRef}
        onMouseUp={handleMouseUp}
        sx={{
          border: "1px solid #ccc",
          padding: 1,
          cursor: "text",
          userSelect: "text",
          minHeight: 50,
        }}
      >
        {getHighlightedText()}
      </Box>
      <Box sx={{ mt: 1 }}>
        <Button variant="outlined" onClick={clearAnnotations} size="small">
          Clear Highlights
        </Button>
      </Box>
      {annotations.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Current Annotations:</Typography>
          <List dense>
            {annotations.map((ann, idx) => (
              <ListItem key={idx} secondaryAction={
                <IconButton edge="end" onClick={() => {
                  const updated = annotations.filter((_, i) => i !== idx);
                  setAnnotations(updated);
                  if (onHighlightChange) onHighlightChange(updated);
                }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }>
                <Typography variant="body2">
                  {ann.errorType} [{ann.start}, {ann.end}]
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

export default TextHighlighter;
