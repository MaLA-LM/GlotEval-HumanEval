import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../services/api"; // Ensure you have this API service

const supportedLanguages = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  "zh-CN": "Chinese",
  ja: "Japanese",
};

const Translator = ({ textToTranslate, row, taskType, showTextField }) => {
  const [translationVisible, setTranslationVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [translationScope, setTranslationScope] = useState("selected");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get text from row based on fields
  const getFullRowText = (row, taskType) => {
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

    const fields = detailOrder[taskType.toLowerCase()] || [];
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

    // Use translationScope to determine what text to translate
    const textToSend = translationScope === "selected" 
      ? textToTranslate 
      : getFullRowText(row, taskType);
    
    try {
      const response = await api.post("api/translate", {
        text: textToSend,
        target_lang: targetLanguage, // Use the selected target language
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
    <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Translation Options
      </Typography>

      <Box sx={{ 
        display: "flex", 
        gap: 2, 
        mb: 2, 
        flexWrap: {
          xs: "wrap",    // Stack on very small screens
          sm: "nowrap"   // Single line from small screens and up
        },
        alignItems: "center" 
      }}>
        <FormControl size="small" sx={{ 
          minWidth: 120,
          flex: { xs: "1 1 100%", sm: "0 1 auto" }
        }}>
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

        <FormControl size="small" sx={{ 
          minWidth: 120,
          flex: { xs: "1 1 100%", sm: "0 1 auto" }
        }}>
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
          sx={{ 
            minWidth: 120, 
            height: 40,
            flex: { xs: "1 1 100%", sm: "0 1 auto" }
          }}
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
            Google translation
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            variant="outlined"
            value={translatedText}
            InputProps={{ readOnly: true }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Translator;
