import React, { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { getFilename } from './FileName';

const steps = [
  "Select Benchmark",
  "Select Model",
  "Select Language",
];

const AnalyticsSidebar = ({ 
  onComplete, 
  selectedTab, 
  taskOptions,
  onMetricsUpdate 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [dataset, setDataset] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedResourceGroup, setSelectedResourceGroup] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [models, setModels] = useState([]);
  const [availableResourceGroups, setAvailableResourceGroups] = useState({});
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [wizardComplete, setWizardComplete] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Simplified dataset options
  const datasetOptions = taskOptions[selectedTab]?.dataset || [];

  // Reset wizard when tab changes
  useEffect(() => {
    setActiveStep(0);
    setDataset("");
    setSelectedModel("");
    setSelectedResourceGroup("");
    setSelectedLanguage("");
    setWizardComplete(false);
    setMetrics(null);
  }, [selectedTab]);

  // When dataset is selected, fetch CSV to extract models
  useEffect(() => {
    if (dataset) {
      const filename = getFilename(dataset);
      fetch(`/metric/${filename}.csv`)
        .then((response) => response.text())
        .then((text) => {
          const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);
          if (lines.length > 1) {
            const parsedModels = [...new Set(lines.slice(1).map((row) => row.split(",")[0]))];
            setModels(parsedModels);
          } else {
            setModels([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching CSV:", error);
          setModels([]);
        });
    } else {
      setModels([]);
    }
  }, [dataset]);

  // Fetch available resource groups and languages
  useEffect(() => {
    fetch("/resource_groups.json")
      .then((response) => response.json())
      .then((json) => {
        setAvailableResourceGroups(json);
      })
      .catch((error) => {
        console.error("Error fetching resource groups:", error);
        setAvailableResourceGroups({});
      });
  }, []);

  // Update available languages when resource group changes
  useEffect(() => {
    if (selectedResourceGroup) {
      const languages = availableResourceGroups[selectedResourceGroup] || [];
      setAvailableLanguages(languages);
      // Reset language selection when resource group changes
      setSelectedLanguage("");
    } else {
      setAvailableLanguages([]);
    }
  }, [selectedResourceGroup, availableResourceGroups]);

  // Advanced text similarity utility
  const calculateTextSimilarity = (target, output) => {
    // Preprocessing
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normTarget = normalizeText(target);
    const normOutput = normalizeText(output);

    // Word-level analysis
    const targetWords = normTarget.split(/\s+/);
    const outputWords = normOutput.split(/\s+/);

    // Compute word-level metrics
    const totalWords = new Set([...targetWords, ...outputWords]).size;
    const commonWords = targetWords.filter(word => outputWords.includes(word));

    // Semantic similarity scores
    const wordOverlapScore = commonWords.length / totalWords;
    
    // Length similarity
    const lengthScore = 1 - Math.abs(normTarget.length - normOutput.length) / 
                        Math.max(normTarget.length, normOutput.length);

    // Substring matching
    const substringScore = normTarget.includes(normOutput) || normOutput.includes(normTarget) 
      ? 0.5 
      : 0;

    // Combine scores with weighted approach
    const overallSimilarity = (
      (wordOverlapScore * 0.4) + 
      (lengthScore * 0.3) + 
      (substringScore * 0.3)
    );

    // Detailed similarity breakdown
    return {
      similarity: overallSimilarity,
      isMatch: overallSimilarity > 0.3, // Adjustable threshold
      details: {
        wordOverlapScore,
        lengthScore,
        substringScore,
        commonWordsCount: commonWords.length,
        totalWordsCount: totalWords
      }
    };
  };

  // Metric calculation function
  const calculateMetrics = async () => {
    try {
      // Construct potential file paths
      const possibleFilePaths = [
        `Aya/outputs/${selectedModel}/${selectedLanguage}.jsonl`,
        `Aya/outputs/${selectedModel}/${selectedLanguage}`,
        `Aya/outputs/${selectedModel}/${selectedLanguage.toLowerCase()}.jsonl`,
        `Aya/outputs/${selectedModel}/${selectedLanguage.toUpperCase()}.jsonl`
      ];

      let response;
      let filePath;

      // Try multiple file paths
      for (const path of possibleFilePaths) {
        try {
          console.log(`Attempting to fetch file: ${path}`);
          response = await fetch(path);
          
          if (response.ok) {
            filePath = path;
            break;
          }
        } catch (pathError) {
          console.log(`Error fetching ${path}:`, pathError);
        }
      }

      if (!response || !response.ok) {
        console.error('Failed to fetch file. Attempted paths:', possibleFilePaths);
        throw new Error(`Could not find JSONL file for ${selectedLanguage}`);
      }
      
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim());

      let similarityResults = [];
      let processedLines = 0;

      // Process lines with advanced similarity
      lines.forEach((line, index) => {
        try {
          const cleanLine = line.trim().replace(/^\uFEFF/, '');
          if (!cleanLine) return;

          const data = JSON.parse(cleanLine);
          const target = String(data.target || "").trim();
          const output = String(data.output || "").trim();

          const similarityResult = calculateTextSimilarity(target, output);
          
          similarityResults.push({
            lineNumber: index + 1,
            target,
            output,
            ...similarityResult
          });

          processedLines++;
        } catch (error) {
          console.error(`Error processing line ${index + 1}:`, error);
        }
      });

      // Advanced metric calculation
      const matchedEntries = similarityResults.filter(entry => entry.isMatch);
      
      // Compute metrics with more nuanced approach
      const precision = matchedEntries.length > 0 
        ? matchedEntries.reduce((sum, entry) => sum + entry.similarity, 0) / matchedEntries.length
        : 0;
      
      const recall = processedLines > 0
        ? matchedEntries.length / processedLines
        : 0;
      
      const f1Score = (precision + recall) > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

      // Calculate accuracy: proportion of correctly matched entries
      const accuracy = processedLines > 0
        ? matchedEntries.length / processedLines
        : 0;

      // Sort and select top entries
      const topSimilarities = similarityResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      // Set metrics state
      const calculatedMetrics = {
        precision: precision.toFixed(2),
        recall: recall.toFixed(2),
        f1Score: f1Score.toFixed(2),
        accuracy: accuracy.toFixed(2),
        details: {
          totalLines: lines.length,
          processedLines,
          matchedLines: matchedEntries.length,
          similarityDetails: similarityResults.slice(0, 20),
          topSimilarities
        }
      };

      setMetrics(calculatedMetrics);
      
      // Call the metrics update callback if provided
      if (onMetricsUpdate) {
        onMetricsUpdate(calculatedMetrics);
      }

    } catch (error) {
      console.error('Comprehensive metrics calculation error:', error);
      
      const errorMetrics = {
        precision: '0.00',
        recall: '0.00',
        f1Score: '0.00',
        accuracy: '0.00',
        error: error.message
      };

      setMetrics(errorMetrics);
      
      if (onMetricsUpdate) {
        onMetricsUpdate(errorMetrics);
      }

      alert(`Error calculating metrics: ${error.message}`);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    const finalFilters = {
      dataset,
      model: selectedModel,
      resourceGroup: selectedResourceGroup,
      language: selectedLanguage
    };

    // Validate inputs
    if (!dataset) {
      console.warn('Dataset is not set');
      return;
    }
    if (!selectedModel) {
      console.warn('Model is not set');
      return;
    }
    if (!selectedResourceGroup) {
      console.warn('Resource Group is not set');
      return;
    }
    if (!selectedLanguage) {
      console.warn('Language is not set');
      return;
    }

    onComplete(finalFilters);
    setWizardComplete(true);

    // Calculate metrics after completing selection
    calculateMetrics();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="dataset-label">Dataset</InputLabel>
            <Select
              label="Dataset"
              labelId="dataset-label"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {datasetOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 1:
        return (
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="model-label">Model</InputLabel>
            <Select
              label="Model"
              labelId="model-label"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!dataset}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {models.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Resource Group Selection */}
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="resource-group-label">Resource Group</InputLabel>
              <Select
                label="Resource Group"
                labelId="resource-group-label"
                value={selectedResourceGroup}
                onChange={(e) => setSelectedResourceGroup(e.target.value)}
                disabled={!selectedModel}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {Object.keys(availableResourceGroups).map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Language Selection */}
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                label="Language"
                labelId="language-label"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={!selectedResourceGroup}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableLanguages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      
      default:
        return <Typography>Unknown Step</Typography>;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mt: 2, mb: 2 }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button 
          color="inherit" 
          disabled={activeStep === 0} 
          onClick={handleBack}
        >
          Back
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleNext}
          disabled={
            (activeStep === 0 && !dataset) || 
            (activeStep === 1 && !selectedModel) || 
            (activeStep === 2 && (!selectedResourceGroup || !selectedLanguage))
          }
        >
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default AnalyticsSidebar;
