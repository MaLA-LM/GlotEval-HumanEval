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
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Chip,
} from "@mui/material";
import HierarchyCheckboxTree from "./HierarchyCheckboxTree";
import { getFilename } from './FileName';

const steps = [
  "Select Benchmark",
  "Select Metric",
  "Choose Filter Type",
  "Select Filter Value",
];

const Sidebar = ({ onComplete, selectedTab, taskOptions }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [dataset, setDataset] = useState("");
  const [metric, setMetric] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [models, setModels] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState({});
  const [wizardComplete, setWizardComplete] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [isCsvLoading, setIsCsvLoading] = useState(false);

  // Get dataset and metric options from taskOptions based on selected tab
  const datasetOptions = taskOptions[selectedTab]?.dataset || [];
  const metricOptions = taskOptions[selectedTab]?.metric || [];

  // Reset activeStep when tab changes
  useEffect(() => {
    setActiveStep(0);
    setDataset("");
    setMetric("");
    setFilterType("");
    setFilterValue("");
    setWizardComplete(false);
  }, [selectedTab]);

  // When dataset is selected, fetch CSV to extract models and languages
  useEffect(() => {
    if (dataset) {
      const filename = getFilename(dataset);
      fetch(`/${filename}.csv`)
        .then((response) => response.text())
        .then((text) => {
          const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);
          if (lines.length > 1) {
            const parsedModels = lines.slice(1).map((row) => row.split(",")[0]);
            setModels(parsedModels);
          } else {
            setModels([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching CSV:", error);
          setModels([]);
          setAvailableLanguages({});
        });
    } else {
      setModels([]);
      setAvailableLanguages({});
    }
  }, [dataset]);

  // Add a new useEffect to fetch available languages from resource_groups.json
  useEffect(() => {
    fetch("/resource_groups.json")
      .then((response) => response.json())
      .then((json) => setAvailableLanguages(json))
      .catch((error) => {
        console.error("Error fetching resource groups:", error);
        setAvailableLanguages({});
      });
  }, []);

  // New useEffect to fetch and parse CSV for visualization when filter type is 'model' and wizard is complete
  useEffect(() => {
    if (wizardComplete && filterType === "model" && dataset && filterValue) {
      setIsCsvLoading(true);
      const filename = getFilename(dataset);
      fetch(`/${filename}.csv`)
        .then((response) => response.text())
        .then((text) => {
          const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);
          if (lines.length > 0) {
            const header = lines[0].split(",").map((s) => s.trim());
            const rows = lines.slice(1).map((line) => {
              const values = line.split(",").map((s) => s.trim());
              const obj = {};
              header.forEach((col, i) => {
                obj[col] = values[i];
              });
              return obj;
            });
            // Filter rows where the first column (header[0]) matches filterValue
            const filteredRows = rows.filter(
              (row) => row[header[0]] === filterValue
            );
            setCsvData({ header, rows: filteredRows });
          }
          setIsCsvLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching CSV for visualization:", error);
          setIsCsvLoading(false);
          setCsvData(null);
        });
    }
  }, [wizardComplete, filterType, dataset, filterValue]);

  // Log dataset and metric when wizard is completed
  React.useEffect(() => {
    if (wizardComplete) {
      console.log('Wizard Completed:', {
        dataset,
        metric,
        filterType,
        filterValue
      });
    }
  }, [wizardComplete, dataset, metric, filterType, filterValue]);

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
      metric,
      filterType,
      filterValue: filterType === 'language' 
        ? (Array.isArray(filterValue) 
          ? filterValue 
          : Object.values(filterValue).flat()) 
        : filterValue
    };

    // Ensure dataset and metric are not undefined
    if (!dataset) {
      console.warn('Dataset is not set');
      return;
    }
    if (!metric) {
      console.warn('Metric is not set');
      return;
    }

    onComplete(finalFilters);
    setWizardComplete(true);
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
            <InputLabel id="metric-label">Metric</InputLabel>
            <Select
              label="Metric"
              labelId="metric-label"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {metricOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 2:
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <FormControlLabel
                value="model"
                control={<Radio />}
                label="Filter by Model"
              />
              <FormControlLabel
                value="language"
                control={<Radio />}
                label="Filter by Language"
              />
            </RadioGroup>
          </FormControl>
        );
      case 3:
        if (filterType === "model") {
          return (
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="model-label">Model</InputLabel>
              <Select
                label="Model"
                labelId="model-label"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {models.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        } else if (filterType === "language") {
          return (
            <Box>
              <Typography variant="h6">Languages</Typography>
              <HierarchyCheckboxTree
                data={availableLanguages}
                onSelectionChange={(selected) => {
                  setFilterValue(selected);
                }}
              />
            </Box>
          );
        } else {
          return <Typography>Please select a filter type.</Typography>;
        }
      default:
        return null;
    }
  };

  const renderSelectedLanguages = () => {
    if (filterType !== 'language' || !filterValue) return null;

    const languages = Array.isArray(filterValue)
      ? filterValue 
      : Object.values(filterValue).flat();

    // If there are too many languages, truncate and show a count
    const MAX_LANGUAGES_TO_SHOW = 10;
    const displayLanguages = languages.slice(0, MAX_LANGUAGES_TO_SHOW);
    const remainingCount = languages.length - MAX_LANGUAGES_TO_SHOW;

    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Selected Languages: {languages.length}
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            maxHeight: '300px', 
            overflowY: 'auto',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 1
          }}
        >
          {displayLanguages.map((lang) => (
            <Chip 
              key={lang} 
              label={lang} 
              size="small" 
              variant="outlined"
              sx={{ 
                m: 0.5,
                maxWidth: '150px',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          ))}
          {remainingCount > 0 && (
            <Chip 
              label={`+${remainingCount} more`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    );
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <Box
      sx={{ width: "300px", borderRight: "1px solid #ccc", padding: "1rem" }}
    >
      {wizardComplete ? (
        <Box>
          <Typography variant="h6">Filters Applied</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '80px' }}>
              Dataset:
            </Typography>
            <Chip 
              label={dataset || 'No Dataset Selected'} 
              size="small" 
              color={dataset ? "primary" : "default"}
              variant="outlined" 
              sx={{ 
                maxWidth: '200px', 
                '& .MuiChip-label': { 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                } 
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '80px' }}>
              Metric:
            </Typography>
            <Chip 
              label={metric || 'No Metric Selected'} 
              size="small" 
              color={metric ? "secondary" : "default"}
              variant="outlined" 
              sx={{ 
                maxWidth: '200px', 
                '& .MuiChip-label': { 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                } 
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '80px' }}>
              Filter:
            </Typography>
            <Chip 
              label={filterType || 'No Filter Selected'} 
              size="small" 
              color={filterType ? "info" : "default"}
              variant="outlined" 
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Filter Value:
            </Typography>
            {Array.isArray(filterValue) && filterValue.length > 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 1
                }}
              >
                {filterValue.slice(0, 20).map((value, index) => (
                  <Chip 
                    key={index} 
                    label={value} 
                    size="small" 
                    variant="outlined" 
                  />
                ))}
                {filterValue.length > 20 && (
                  <Chip 
                    label={`+${filterValue.length - 20} more`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </Box>
            ) : (
              <Chip 
                label={filterValue || 'No Filter Value Selected'} 
                size="small" 
                color={filterValue ? "default" : "default"}
                variant="outlined" 
              />
            )}
          </Box>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => {
              setWizardComplete(false);
              setActiveStep(0);
            }}
          >
            Edit Filters
          </Button>
        </Box>
      ) : (
        <>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 2 }}>{renderStepContent(activeStep)}</Box>
          {renderSelectedLanguages()}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Sidebar;
