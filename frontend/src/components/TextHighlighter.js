import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Translator from "./Translator";

const errorColors = {
  "Grammar Error": "#ffcccc",
  "Spelling or Typographical Error": "#d1e7dd",
  "Incoherent or Illogical": "#fff3cd",
  "Off-topic or Irrelevant": "#cfe2ff",
  Redundancy: "#e2e3e5",
  "Ambiguity or Vagueness": "#f8d7da",
  "Cultural Sensitivity or Offensive Content": "#f5c2c7",
};

function getSelectionCharacterOffsetWithin(element) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };
  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  const start = preCaretRange.toString().length;
  const selectedText = range.toString();
  return { start, end: start + selectedText.length };
}

function renderAnnotatedText(text, annotations) {
  if (!annotations || annotations.length === 0) return text;
  const len = text.length;
  let segments = [];
  let i = 0;
  while (i < len) {
    let appliedAnn = null;
    annotations.forEach((ann) => {
      if (i >= ann.start && i < ann.end) {
        appliedAnn = ann;
      }
    });
    let j = i;
    while (j < len) {
      let currentAnn = null;
      annotations.forEach((ann) => {
        if (j >= ann.start && j < ann.end) {
          currentAnn = ann;
        }
      });
      if (
        (appliedAnn &&
          (!currentAnn || currentAnn.errorType !== appliedAnn.errorType)) ||
        (!appliedAnn && currentAnn)
      ) {
        break;
      }
      j++;
    }
    const segmentText = text.slice(i, j);
    if (appliedAnn) {
      segments.push(
        <span
          key={i}
          style={{
            backgroundColor: errorColors[appliedAnn.errorType] || "#ffff99",
          }}
        >
          {segmentText}
        </span>
      );
    } else {
      segments.push(segmentText);
    }
    i = j;
  }
  return segments;
}

function TextHighlighter({
  text,
  errorType,
  onHighlightChange,
  row,
  taskType,
}) {
  const originalTextRef = useRef(text);
  const containerRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);

  const handleMouseUp = () => {
    const offsets = getSelectionCharacterOffsetWithin(containerRef.current);
    if (offsets.start === offsets.end) return;
    setCurrentSelection({ start: offsets.start, end: offsets.end });
  };

  const handleLabelSelectedText = () => {
    if (!currentSelection || !errorType) return;
    const newAnnotation = { ...currentSelection, errorType };
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    if (onHighlightChange) onHighlightChange(updatedAnnotations);
    setCurrentSelection(null);
    window.getSelection().removeAllRanges();
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    if (onHighlightChange) onHighlightChange([]);
  };

  const highlightedContent = renderAnnotatedText(
    originalTextRef.current,
    annotations
  );

  return (
    <Box>
      <Box
        ref={containerRef}
        onMouseUp={handleMouseUp}
        sx={{
          border: "1px solid #ccc",
          padding: 1,
          cursor: "text",
          userSelect: "text",
          minHeight: 50,
        }}
      >
        {highlightedContent}
      </Box>

      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleLabelSelectedText}
          size="small"
        >
          Label Selected Text
        </Button>
        <Button variant="outlined" onClick={clearAnnotations} size="small">
          Clear Highlights
        </Button>
      </Box>

      {annotations.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Current Annotations:</Typography>
          <List dense>
            {annotations.map((ann, idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => {
                      const updated = annotations.filter((_, i) => i !== idx);
                      setAnnotations(updated);
                      if (onHighlightChange) onHighlightChange(updated);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Typography variant="body2">
                  {ann.errorType} [{ann.start}, {ann.end}]
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Translator
        textToTranslate={
          currentSelection
            ? originalTextRef.current.slice(
                currentSelection.start,
                currentSelection.end
              )
            : ""
        }
        row={row}
        taskType={taskType}
      />
    </Box>
  );
}

export default TextHighlighter;
