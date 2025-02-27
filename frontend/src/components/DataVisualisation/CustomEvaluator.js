import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Stepper,
    Step,
    StepLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { getFilename } from './FileName';

const steps = [
    "Select Benchmark",
    "Select Model",
    "Select Language",
    "Upload Evaluator"
];

const benchmarkOptions = {
    "Text Classification": ["SIB-200", "Taxi-1500"],
    "Machine Translation": ["Flores200 Eng-X", "Flores200 X-Eng"],
    "Text Summarization": ["XLSum"],
    "Open-ended Chat": ["Aya", "Aya-Self", "PolyWrite"],
    "Machine Comprehension": ["BELEBELE", "arc_multilingual"],
    "Intrinsic Evaluation": ["glot500", "pbc"]
};

const CustomEvaluator = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [taskType, setTaskType] = useState('');
    const [benchmark, setBenchmark] = useState('');
    const [model, setModel] = useState('');
    const [language, setLanguage] = useState('');
    const [evaluatorFile, setEvaluatorFile] = useState(null);
    const [models, setModels] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Fetch models when benchmark changes
    useEffect(() => {
        if (benchmark) {
            const filename = getFilename(benchmark);
            fetch(`/metric/${filename}.csv`)
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
                });
        }
    }, [benchmark]);

    // Fetch languages when benchmark changes
    useEffect(() => {
        if (benchmark) {
            fetch("/resource_groups.json")
                .then((response) => response.json())
                .then((json) => {
                    // Flatten the language groups into a single array
                    const allLanguages = Object.values(json).flat();
                    setLanguages(allLanguages);
                })
                .catch((error) => {
                    console.error("Error fetching languages:", error);
                    setLanguages([]);
                });
        }
    }, [benchmark]);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleFileSelection = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'py' && fileExt !== 'js') {
            setError('Only Python (.py) and JavaScript (.js) files are allowed for evaluator');
            return;
        }
        setEvaluatorFile(file);
        setError(null);
    };

    const handleUploadAndEvaluate = async () => {
        if (!evaluatorFile || !benchmark || !model || !language) {
            setError('Please complete all steps before uploading');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('evaluator', evaluatorFile);
            formData.append('benchmark', benchmark);
            formData.append('model', model);
            formData.append('language', language);

            const response = await fetch('/api/evaluator/upload', {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data.results);
            setError(null);
        } catch (err) {
            setError('Failed to upload and evaluate: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Task Type</InputLabel>
                            <Select
                                value={taskType}
                                onChange={(e) => {
                                    setTaskType(e.target.value);
                                    setBenchmark('');
                                    setModel('');
                                    setLanguage('');
                                }}
                                label="Task Type"
                            >
                                {Object.keys(benchmarkOptions).map((task) => (
                                    <MenuItem key={task} value={task}>
                                        {task}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {taskType && (
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel>Benchmark</InputLabel>
                                <Select
                                    value={benchmark}
                                    onChange={(e) => setBenchmark(e.target.value)}
                                    label="Benchmark"
                                >
                                    {benchmarkOptions[taskType].map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>Model</InputLabel>
                        <Select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            label="Model"
                        >
                            {models.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 2:
                return (
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            label="Language"
                        >
                            {languages.map((lang) => (
                                <MenuItem key={lang} value={lang}>
                                    {lang}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 3:
                return (
                    <Box>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<UploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Select Evaluator File
                            <input
                                type="file"
                                hidden
                                accept=".py,.js"
                                onChange={handleFileSelection}
                            />
                        </Button>
                        {evaluatorFile && (
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Selected file: {evaluatorFile.name}
                            </Typography>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Custom Evaluator
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ mb: 3 }}>
                    {renderStepContent(activeStep)}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                        onClick={handleBack}
                        disabled={activeStep === 0}
                    >
                        Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUploadAndEvaluate}
                            disabled={isUploading || !evaluatorFile}
                        >
                            {isUploading ? <CircularProgress size={24} /> : 'Upload and Evaluate'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={
                                (activeStep === 0 && !benchmark) ||
                                (activeStep === 1 && !model) ||
                                (activeStep === 2 && !language)
                            }
                        >
                            Next
                        </Button>
                    )}
                </Box>

                {result && (
                    <Box sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Evaluation Results
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `evaluation_results_${benchmark}_${model}_${language}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Download Results
                            </Button>
                        </Box>
                        <Paper sx={{ p: 2 }}>
                            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </Paper>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default CustomEvaluator;
