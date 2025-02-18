import React, { useState, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Alert,
} from "@mui/material";
import api from "../services/api";
import TextHighlighter from "./TextHighlighter";

const errorOptions = [
  "Grammar Error",
  "Spelling or Typographical Error",
  "Incoherent or Illogical",
  "Off-topic or Irrelevant",
  "Redundancy",
  "Ambiguity or Vagueness",
  "Cultural Sensitivity or Offensive Content",
];

function FeedbackSidebar({ 
  row, 
  taskType, 
  onClose, 
  onCommentSubmit, 
  isDialog, 
  userFeedback 
}) {
  // Determine inline field based on task type.
  let inlineField = "";
  const taskKey = taskType.toLowerCase();
  if (taskKey === "translation") {
    inlineField = "hyp_text";
  } else if (taskKey === "classification") {
    inlineField = "predicted_category";
  } else if (taskKey === "summarization" || taskKey === "generation") {
    inlineField = "output";
  }
  const fieldText = row[inlineField] || "No text available";

  // State variables.
  const [errorType, setErrorType] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [annMsg, setAnnMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [question, setQuestion] = useState("");
  const [comment, setComment] = useState("");
  const [commErrorMsg, setCommErrorMsg] = useState("");

  // For resizing the drawer (optional).
  const [drawerWidth, setDrawerWidth] = useState("800px");
  const [resizerHover, setResizerHover] = useState(false);
  const resizerRef = useRef(null);

  const handleMouseDown = (e) => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = window.innerWidth - e.clientX;
    setDrawerWidth(Math.max(100, Math.min(newWidth, window.innerWidth - 50)));
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Task-specific questions.
  const taskQuestions = {
    translation: [
      "Are there specific phrases that seem mistranslated?",
      "Does the translation maintain the original tone?",
    ],
    classification: [
      "Does the predicted category match the input?",
      "Are there any misclassifications?",
    ],
    summarization: [
      "Does the summary capture the main points?",
      "Are any crucial details missing?",
    ],
    generation: ["Is the generated text coherent?", "Is the output relevant?"],
  };

  // Order for row details.
  const detailOrder = {
    classification: [
      "model_name",
      "test_lang",
      "prompt",
      "predicted_category",
      "correct_category",
    ],
    translation: [
      "model_name",
      "src_lang",
      "tgt_lang",
      "src_text",
      "ref_text",
      "hyp_text",
      "prompt",
    ],
    summarization: ["model_name", "input", "target", "output"],
    generation: ["model_name", "input", "target", "output"],
  };

  const renderRowDetails = () => {
    const fields = detailOrder[taskKey] || [];
    return (
      <Box>
        <Typography variant="body1">
          <strong>Entry ID:</strong> {row.entry_id}
        </Typography>
        {fields.map((field) => (
          <Typography key={field} variant="body1">
            <strong>{field.replace("_", " ").toUpperCase()}:</strong>{" "}
            {typeof row[field] === "object" && row[field] !== null
              ? JSON.stringify(row[field])
              : row[field] || "N/A"}
          </Typography>
        ))}
      </Box>
    );
  };

  // Submit annotations to backend (each annotation becomes a row).
  const handleAnnotationsSubmit = async () => {
    if (annotations.length === 0) {
      setAnnMsg("No annotations to submit.");
      return;
    }
    const annotationPayload = {
      entry_id: row.entry_id,
      row_data: row,
      annotations,
    };
    try {
      await api.post("/api/annotation", annotationPayload);
      setAnnMsg("Annotations submitted successfully.");
    } catch (error) {
      setAnnMsg(
        "Error submitting annotations: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Submit comment.
  const handleCommentSubmit = async () => {
    if (!rating || !question || comment.trim() === "") {
      setCommErrorMsg(
        "Please provide a rating, select a question, and enter a comment."
      );
      return;
    }
    setCommErrorMsg("");
    const commentPayload = {
      entry_id: row.entry_id,
      row_data: row,
      question,
      feedback: comment,
      rating,
    };
    try {
      await api.post("/api/comments", commentPayload);
      onCommentSubmit();
    } catch (error) {
      setCommErrorMsg(
        "Error submitting comment: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      p: 3,
      overflowY: 'auto',
      '& .MuiFormControl-root': {
        width: '100%',
        mb: 2
      },
      '& .MuiTextField-root': {
        width: '100%',
        mb: 2
      }
    }}>
      {isDialog && userFeedback && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'warning.light', 
          borderRadius: 1 
        }}>
          <Typography variant="subtitle1" color="warning.dark" sx={{ fontWeight: 'bold' }}>
            Previous Feedback
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Question:</strong> {userFeedback.question}
            </Typography>
            <Typography variant="body2">
              <strong>Feedback:</strong> {userFeedback.comment}
            </Typography>
            <Typography variant="body2">
              <strong>Rating:</strong> {userFeedback.rating}/5
            </Typography>
          </Box>
        </Box>
      )}

      <Typography variant="h6">Review Details</Typography>
      <Box sx={{ my: 1 }}>{renderRowDetails()}</Box>

      {/* Section A: Inline Error Labeling */}
      <Box sx={{ my: 2, borderBottom: "1px solid #ccc", pb: 2 }}>
        <Typography variant="subtitle1">Inline Error Labeling</Typography>
        <FormControl fullWidth sx={{ my: 1 }}>
          <InputLabel>Error Type</InputLabel>
          <Select
            value={errorType}
            label="Error Type"
            onChange={(e) => setErrorType(e.target.value)}
          >
            {errorOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextHighlighter
          text={fieldText}
          errorType={errorType}
          onHighlightChange={(anns) => {
            setAnnotations(anns);
          }}
          row={row}
          taskType={taskType}
        />
        <Button
          variant="contained"
          onClick={handleAnnotationsSubmit}
          sx={{ mt: 1 }}
        >
          Submit Annotations
        </Button>
        {annMsg && (
          <Alert severity="info" sx={{ mt: 1 }}>
            {annMsg}
          </Alert>
        )}
      </Box>

      {/* Section B: Comment Submission */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1">Submit Comment</Typography>
        <Box sx={{ my: 1 }}>
          <Typography component="legend">Rating</Typography>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
          />
        </Box>
        <FormControl component="fieldset" sx={{ my: 1 }}>
          <Typography variant="body2">Task-specific Question:</Typography>
          <RadioGroup
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          >
            {(taskQuestions[taskKey] || []).map((q, idx) => (
              <FormControlLabel
                key={idx}
                value={q}
                control={<Radio />}
                label={q}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <TextField
          label="Comments"
          multiline
          fullWidth
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ my: 1 }}
        />
        {commErrorMsg && <Alert severity="error">{commErrorMsg}</Alert>}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCommentSubmit}>
            Submit Comment
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default FeedbackSidebar;
