import React, { useState } from "react";
import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import api from "../services/api"; // Ensure you have this API service
const Translator = ({ row, taskType }) => {
  // State to control the visibility of the translation
  const [translationVisible, setTranslationVisible] = useState(false);
  // State to store the translated text
  const [translatedText, setTranslatedText] = useState("");
  // State to control the loading state
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error that occurs during translation
  const [error, setError] = useState(null);

  /**
   * Constructs the full text to be translated based on the row and task type.
   * @param {Object} row - The row data containing the fields to be translated.
   * @param {string} taskType - The type of task (classification, translation, summarization, generation).
   * @returns {string} - The full text to be translated.
   */
  const getFullRowText = (row, taskType) => {
    const detailOrder = {
      classification: ["prompt"],
      translation: ["src_text", "ref_text", "hyp_text", "prompt"],
      summarization: ["input", "target", "output"],
      generation: ["input", "target", "output"],
    };

    const fields = detailOrder[taskType] || [];
    return fields
      .map((field) => {
        const value = row[field];
        return `${field.toUpperCase()}: ${
          typeof value === "object" ? JSON.stringify(value) : value || "N/A"
        }`;
      })
      .join("\n");
  };

  /**
   * Handles the translation process.
   */
  const handleTranslate = async () => {
    setIsLoading(true);
    setError(null);

    const textToTranslate = getFullRowText(row, taskType);
    console.log("Text to Translate:", textToTranslate);
    console.log("Tasktype:", taskType);

    try {
      const response = await api.post("api/translate", {
        text: textToTranslate,
        target_lang: "en",
      });

      setTranslatedText(
        Array.isArray(response.data.translated_text)
          ? response.data.translated_text.join(" ")
          : response.data.translated_text
      );
      setTranslationVisible(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Button
        size="small"
        onClick={handleTranslate}
        disabled={isLoading}
        sx={{ alignSelf: "flex-start" }}
        startIcon={<GTranslateIcon />}
      >
        {isLoading ? "Translating..." : "Google Translate"}
      </Button>

      {error && <Typography color="error">{error}</Typography>}
      {translationVisible && translatedText && (
        <Box sx={{ mt: 0 }}>
          {/* <Typography variant="subtitle2" gutterBottom>
            Google translation
          </Typography> */}
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={translatedText}
            InputProps={{ readOnly: true }}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 1,
              width: "100%",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Translator;
