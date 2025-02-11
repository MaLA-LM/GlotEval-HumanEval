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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// Define background colors for error types.
const errorColors = {
  "Grammar Error": "#ffcccc",
  "Spelling or Typographical Error": "#d1e7dd",
  "Incoherent or Illogical": "#fff3cd",
  "Off-topic or Irrelevant": "#cfe2ff",
  "Redundancy": "#e2e3e5",
  "Ambiguity or Vagueness": "#f8d7da",
  "Cultural Sensitivity or Offensive Content": "#f5c2c7",
};

// List of target languages.
const targetLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

/**
 * Helper to compute selection offsets relative to the container’s text.
 * Assumes that the container’s text equals the original text.
 */
function getSelectionOffsets(container) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };
  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;
  const selectedText = range.toString();
  return { start, end: start + selectedText.length };
}

/**
 * For each character index in text, if one or more annotations cover that character,
 * use the annotation that was applied last.
 */
function renderAnnotatedText(text, annotations) {
  if (!annotations || annotations.length === 0) return text;
  const len = text.length;
  let segments = [];
  let i = 0;
  while (i < len) {
    // Determine which annotation (if any) covers index i.
    let appliedAnn = null;
    annotations.forEach((ann) => {
      if (i >= ann.start && i < ann.end) {
        appliedAnn = ann; // later annotations override earlier ones (they are appended)
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
        (appliedAnn && (!currentAnn || currentAnn.errorType !== appliedAnn.errorType)) ||
        (!appliedAnn && currentAnn)
      ) {
        break;
      }
      j++;
    }
    const segmentText = text.slice(i, j);
    if (appliedAnn) {
      segments.push(
        <span key={i} style={{ backgroundColor: errorColors[appliedAnn.errorType] || "#ffff99" }}>
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

function TextHighlighter({ text, errorType, onHighlightChange }) {
  // Save original text (assumed constant).
  const originalTextRef = useRef(text);
  const containerRef = useRef(null);
  // Annotations: array of objects { start, end, errorType }.
  const [annotations, setAnnotations] = useState([]);
  // The current selection span.
  const [currentSelection, setCurrentSelection] = useState(null);

  // Translation-related state.
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("en");
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  // When the mouse is released, record the selection offsets.
  const handleMouseUp = () => {
    const offsets = getSelectionOffsets(containerRef.current);
    if (offsets.start === offsets.end) return;
    setCurrentSelection(offsets);
  };

  // When "Label Selected Text" is clicked, append a new annotation.
  const handleLabelSelectedText = () => {
    if (!currentSelection || !errorType) return;
    // For simplicity, we simply append the new annotation.
    const newAnnotation = { ...currentSelection, errorType };
    // In our simple version, we do not merge or subtract; we simply push the new annotation.
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    if (onHighlightChange) onHighlightChange(updatedAnnotations);
    setCurrentSelection(null);
    window.getSelection().removeAllRanges();
  };

  // Clear all annotations.
  const clearAnnotations = () => {
    setAnnotations([]);
    if (onHighlightChange) onHighlightChange([]);
  };

  // ----- Google Translate Implementation -----
  // Replace this function with an actual call using your API key.
  async function translateText(inputText, targetLang) {
    const apiKey = "YOUR_API_KEY"; // <-- Provide your API key later.
    const url = "https://translation.googleapis.com/language/translate/v2";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          q: inputText,
          target: targetLang,
          source: "auto", // Auto-detect the source language.
          format: "text",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error.message || `HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (err) {
      throw err;
    }
  }

  const handleTranslate = async () => {
    setTranslationError("");
    setTranslationLoading(true);
    try {
      const result = await translateText(originalTextRef.current, selectedTargetLanguage);
      setTranslatedText(result);
      setTranslationVisible(true);
    } catch (err) {
      console.error("Translation error:", err);
      setTranslationError(err.message || "Translation failed. Please try again.");
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleHideTranslation = () => {
    setTranslationVisible(false);
  };

  // Render the annotated text using a simple algorithm:
  const highlightedContent = renderAnnotatedText(originalTextRef.current, annotations);

  return (
    <Box>
      {/* Text display area */}
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
      {/* Annotation action buttons */}
      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <Button variant="outlined" onClick={handleLabelSelectedText} size="small">
          Label Selected Text
        </Button>
        <Button variant="outlined" onClick={clearAnnotations} size="small">
          Clear Highlights
        </Button>
      </Box>
      {/* Display list of current annotations */}
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
      {/* Translation area with target language dropdown */}
      <Box
        sx={{
          mt: 2,
          border: "1px dashed gray",
          p: 1,
          bgcolor: "#f9f9f9",
        }}
      >
        <Typography variant="subtitle2" color="textSecondary">
          Translation
        </Typography>
        {/* Dropdown to select target language */}
        <FormControl size="small" sx={{ mt: 1, minWidth: 150 }}>
          <InputLabel>Target Language</InputLabel>
          <Select
            label="Target Language"
            value={selectedTargetLanguage}
            onChange={(e) => setSelectedTargetLanguage(e.target.value)}
          >
            {targetLanguages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 1 }}>
          {translationLoading ? (
            <Typography variant="body2">Translating…</Typography>
          ) : translationVisible ? (
            <>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={translatedText}
                sx={{ mt: 1 }}
                InputProps={{ readOnly: true }}
              />
              <Button variant="outlined" onClick={handleHideTranslation} size="small" sx={{ mt: 1 }}>
                Hide Translation
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" onClick={handleTranslate} size="small">
                Translate to {targetLanguages.find((l) => l.code === selectedTargetLanguage)?.name}
              </Button>
              {translationError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {translationError}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default TextHighlighter;
