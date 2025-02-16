import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import api from "../services/api"; // Ensure you have this API service
const Translator = ({ row, taskType }) => {
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
        variant="contained"
        onClick={handleTranslate}
        disabled={isLoading}
        sx={{ alignSelf: "flex-start" }}
      >
        {isLoading ? "Translating..." : "Translate"}
      </Button>

      {error && <Typography color="error">{error}</Typography>}
      {translationVisible && translatedText && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Google translation
          </Typography>
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
