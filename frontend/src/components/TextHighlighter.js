import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api"; // Import the api service

const errorColors = {
  "Grammar Error": "#ffcccc",
  "Spelling or Typographical Error": "#d1e7dd",
  "Incoherent or Illogical": "#fff3cd",
  "Off-topic or Irrelevant": "#cfe2ff",
  "Redundancy": "#e2e3e5",
  "Ambiguity or Vagueness": "#f8d7da",
  "Cultural Sensitivity or Offensive Content": "#f5c2c7",
};

const supportedLanguages = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'zh': 'Chinese',
  'ja': 'Japanese'
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

// Helper function to get text from row based on fields
const getFullRowText = (row, taskType) => {
  const detailOrder = {
    classification: ["model_name", "test_lang", "prompt", "predicted_category", "correct_category"],
    translation: ["model_name", "src_lang", "tgt_lang", "src_text", "ref_text", "hyp_text", "prompt"],
    summarization: ["model_name", "input", "target", "output"],
    generation: ["model_name", "input", "target", "output"],
  };

  const fields = detailOrder[taskType.toLowerCase()] || [];
  return fields.map(field => {
    const value = row[field];
    return `${field.toUpperCase()}: ${
      typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'
    }`;
  }).join('\n');
};

function TextHighlighter({ text, errorType, onHighlightChange, row, taskType }) {
  const originalTextRef = useRef(text);
  const containerRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [translationScope, setTranslationScope] = useState("selected");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleTranslate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let textToTranslate;
      if (translationScope === "selected" && currentSelection) {
        textToTranslate = originalTextRef.current.slice(currentSelection.start, currentSelection.end);
      } else {
        // Get full row text for translation
        textToTranslate = getFullRowText(row, taskType);
      }

      if (!textToTranslate.trim()) {
        throw new Error("Please select text to translate or choose 'Entire Text'");
      }

      const response = await api.post('/translate', {
        text: textToTranslate,
        target_lang: targetLanguage
      });

      setTranslatedText(Array.isArray(response.data.translated_text) 
        ? response.data.translated_text.join(' ') 
        : response.data.translated_text);
      setTranslationVisible(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightedContent = renderAnnotatedText(originalTextRef.current, annotations);

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
        <Button variant="outlined" onClick={handleLabelSelectedText} size="small">
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

      <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Translation Options
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              label="Language"
            >
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Translate</InputLabel>
            <Select
              value={translationScope}
              onChange={(e) => setTranslationScope(e.target.value)}
              label="Translate"
            >
              <MenuItem value="selected">Selected Text</MenuItem>
              <MenuItem value="entire">Entire Entry</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={handleTranslate}
            disabled={isLoading}
          >
            {isLoading ? "Translating..." : "Translate"}
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {translationVisible && translatedText && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Translation
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={translatedText}
              InputProps={{ readOnly: true }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default TextHighlighter;