// src/components/TextHighlighter.js
import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Collapse,
  TextField,
  Typography,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// Mapping error types to colors (customize as needed)
const errorColors = {
  "Grammar Error": "#ffcccc",
  "Spelling or Typographical Error": "#d1e7dd",
  "Incoherent or Illogical": "#fff3cd",
  "Off-topic or Irrelevant": "#cfe2ff",
  "Redundancy": "#e2e3e5",
  "Ambiguity or Vagueness": "#f8d7da",
  "Cultural Sensitivity or Offensive Content": "#f5c2c7",
};

function TextHighlighter({ text, errorType, onHighlightChange }) {
  const textRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  // When mouse is released, record the selection (using offsets from a single text node)
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    if (!textRef.current.contains(selection.anchorNode)) return;
    const anchor = selection.anchorOffset;
    const focus = selection.focusOffset;
    const start = Math.min(anchor, focus);
    const end = Math.max(anchor, focus);
    setCurrentSelection({ start, end });
  };

  // When "Label Selected Text" is clicked, record the annotation.
  const handleLabelSelectedText = () => {
    if (!currentSelection || !errorType) return;
    const newAnnotation = { ...currentSelection, errorType };
    // Allow multiple annotations (even overlapping). Simply add it.
    const updatedAnnotations = [...annotations, newAnnotation];
    updatedAnnotations.sort((a, b) => a.start - b.start);
    setAnnotations(updatedAnnotations);
    if (onHighlightChange) onHighlightChange(updatedAnnotations);
    setCurrentSelection(null);
    window.getSelection().removeAllRanges();
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    if (onHighlightChange) onHighlightChange([]);
  };

  // Dummy translation: simulate a delay and then return the original text appended with a note.
  const simulateTranslate = (inputText) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(inputText + " (translated to English)");
      }, 1000);
    });
  };

  const handleTranslate = async () => {
    const result = await simulateTranslate(text);
    setTranslatedText(result);
    setTranslateOpen(true);
  };

  // Render text with annotations highlighted.
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
      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <Button variant="outlined" onClick={handleLabelSelectedText} size="small">
          Label Selected Text
        </Button>
        <Button variant="outlined" onClick={clearAnnotations} size="small">
          Clear Highlights
        </Button>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Button variant="outlined" onClick={handleTranslate} size="small">
          Google Translate to English
        </Button>
        <Collapse in={translateOpen}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={translatedText}
            sx={{ mt: 1 }}
            InputProps={{
              readOnly: true,
            }}
          />
        </Collapse>
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
    </Box>
  );
}

export default TextHighlighter;
