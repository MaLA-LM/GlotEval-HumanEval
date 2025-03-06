/* 

Install following libraries:

npm i papaparse
npm i react-chartjs-2 chart.js
npm i chartjs-plugin-datalabels


*/

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import { benchmarkLanguages } from "./benchmarkLanguages.js";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

import TableData from "./Table.jsx";

import performance from "./performance.js";

// Chart.js

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Metrics = () => {
  const [selectedTasks, setSelectedTasks] = useState([]);

  const [selectedBenchmarks, setSelectedBenchmarks] = useState([]);

  const [selectedModels, setSelectedModels] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [selectedValues, setSelectedValues] = useState([]);

  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [data, setData] = useState([]);

  const [showTable, setShowTable] = useState(false);

  // Chart
  const [showChart, setShowChart] = useState(false);

  const [chartData, setChartData] = useState(null);

  const [selectedBenchmark, setSelectedBenchmark] = useState(null);

  const taskBenchmarks = {
    "Text Classification": ["SIB-200", "Taxi-1500"],
    "Machine Translation": [
      "Flores-200-Eng-X-BLEU",
      "Flores-200-Eng-X-chrf",
      "Flores-200-X-Eng-BLEU",
      "Flores-200-X-Eng-chrf",
    ],
    "Text Summarization": ["XL-Sum-BERTScore", "XL-Sum-ROUGE"],
    "Open-ended Chat": ["Aya-BLEU", "Aya-Self-BLEU", "PolyWrite"],
    "Machine Comprehension": ["BELEBELE", "arc_multilingual"],
    "Intrinsic Evaluation": ["glot500", "pbc"],
  };

  const benchmarkModels = {
    "SIB-200": [
      "bloom-7b1",
      "bloomz-7b1",
      "CodeLlama-7b-hf",
      "gemma-2-9b",
      "gemma-7b",
      "emma-500-llama2-7b",
      "Llama-2-7b-chat-hf",
      "Llama-2-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v1",
      "mala-500-10b-v2",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "mGPT",
      "mGPT-13B",
      "occiglot-7b-eu5-instruct",
      "occiglot-7b-eu5",
      "Qwen1.5-7B",
      "Qwen2-7B",
      "TowerBase-7B-v0.1",
      "TowerInstruct-7B-v0.2",
      "xglm-7.5B",
      "yayi-7b",
      "yayi-7b-llama2",
    ],

    "Taxi-1500": [
      "mala-500-10b-v1",
      "LLaMAX2-7B",
      "mala-500-10b-v2",
      "occiglot-7b-eu5",
      "Qwen2-7B",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "occiglot-7b-eu5-instruct",
      "gemma-2-9b",
      "TowerBase-7B-v0.1",
      "yayi-7b-llama2",
      "Llama-2-7b-hf",
      "TowerInstruct-7B-v0.2",
      "mGPT-13B",
      "CodeLlama-7b-hf",
      "bloomz-7b1",
      "yayi-7b",
      "Llama-2-7b-chat-hf",
      "LLaMAX2-7B-Alpaca",
      "bloom-7b1",
      "gemma-7b",
      "mGPT",
      "Qwen1.5-7B",
      "xglm-7.5B",
    ],

    "Flores-200-Eng-X-BLEU": [
      "emma-500-llama2-7b",
      "Llama-2-7b-hf",
      "Llama-2-7b-chat-hf",
      "CodeLlama-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "TowerInstruct-7B-v0.2",
      "TowerBase-7B-v0.1",
      "bloom-7b1",
      "bloomz-7b1",
      "mGPT",
      "mGPT-13B",
      "yayi-7b-llama2",
      "yayi-7b",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "gemma-2-9b",
      "gemma-7b",
      "Qwen2-7B",
      "Qwen1.5-7B",
    ],

    "Flores-200-Eng-X-chrf": [
      "emma-500-llama2-7b",
      "Llama-2-7b-hf",
      "Llama-2-7b-chat-hf",
      "CodeLlama-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "TowerInstruct-7B-v0.2",
      "TowerBase-7B-v0.1",
      "bloom-7b1",
      "bloomz-7b1",
      "mGPT",
      "mGPT-13B",
      "yayi-7b-llama2",
      "yayi-7b",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "gemma-2-9b",
      "gemma-7b",
      "Qwen2-7B",
      "Qwen1.5-7B",
    ],

    "Flores-200-X-Eng-BLEU": [
      "emma-500-llama2-7b",
      "Llama-2-7b-hf",
      "Llama-2-7b-chat-hf",
      "CodeLlama-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "TowerInstruct-7B-v0.2",
      "TowerBase-7B-v0.1",
      "bloom-7b1",
      "bloomz-7b1",
      "mGPT",
      "mGPT-13B",
      "yayi-7b-llama2",
      "yayi-7b",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "gemma-2-9b",
      "gemma-7b",
      "Qwen2-7B",
      "Qwen1.5-7B",
    ],

    "Flores-200-X-Eng-chrf": [
      "emma-500-llama2-7b",
      "Llama-2-7b-hf",
      "Llama-2-7b-chat-hf",
      "CodeLlama-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "TowerInstruct-7B-v0.2",
      "TowerBase-7B-v0.1",
      "bloom-7b1",
      "bloomz-7b1",
      "mGPT",
      "mGPT-13B",
      "yayi-7b-llama2",
      "yayi-7b",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "gemma-2-9b",
      "gemma-7b",
      "Qwen2-7B",
      "Qwen1.5-7B",
    ],

    "XL-Sum-BERTScore": [
      "bloom-7b1",
      "bloomz-7b1",
      "CodeLlama-7b-hf",
      "gemma-2-9b",
      "gemma-7b",
      "emma-500-llama2-7b",
      "Llama-2-7b-chat-hf",
      "Llama-2-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v1",
      "mala-500-10b-v2",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "mGPT",
      "mGPT-13B",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Qwen1.5-7B",
      "Qwen2-7B",
      "TowerBase-7B-v0.1",
      "TowerInstruct-7B-v0.2",
      "yayi-7b",
      "yayi-7b-llama2",
    ],

    "XL-Sum-ROUGE": [
      "bloom-7b1",
      "bloomz-7b1",
      "CodeLlama-7b-hf",
      "gemma-2-9b",
      "gemma-7b",
      "Llama-2-7b-chat-hf",
      "Llama-2-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v1",
      "mala-500-10b-v2",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "mGPT",
      "mGPT-13B",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Qwen1.5-7B",
      "Qwen2-7B",
      "TowerBase-7B-v0.1",
      "TowerInstruct-7B-v0.2",
      "yayi-7b",
      "yayi-7b-llama2",
    ],

    "Aya-BLEU": [
      "emma-500-llama2-7b",
      "Qwen2-7B",
      "Qwen1.5-7B",
      "Meta-Llama-3.1-8B",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "yayi-7b-llama2",
      "Meta-Llama-3-8B",
      "gemma-2-9b",
      "TowerInstruct-7B-v0.2",
      "occiglot-7b-eu5",
      "TowerBase-7B-v0.1",
      "mGPT-13B	",
      "gemma-7b	",
      "mGPT	",
      "Llama-2-7b-hf	",
      "CodeLlama-7b-hf	",
      "Llama-2-7b-chat-hf	",
      "yayi-7b",
      "bloom-7b1",
      "occiglot-7b-eu5-instruct",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "bloomz-7b1",
    ],

    "Aya-Self-BLEU": [
      "occiglot-7b-eu5-instruct",
      "occiglot-7b-eu5",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "emma-500-llama2-7b",
      "Llama-2-7b-chat-hf",
      "CodeLlama-7b-hf",
      "bloom-7b1",
      "Qwen2-7B",
      "Qwen1.5-7B",
      "Meta-Llama-3.1-8B",
      "Meta-Llama-3-8B",
      "TowerInstruct-7B-v0.2",
      "TowerBase-7B-v0.1",
      "gemma-2-9b",
      "Llama-2-7b-hf",
      "bloomz-7b1",
      "yayi-7b-llama2",
      "gemma-7b",
      "mGPT-13B",
      "mGPT",
      "yayi-7b",
    ],

    PolyWrite: [
      "Llama-2-7b-hf",
      "Llama-2-7b-chat-hf",
      "CodeLlama-7b-hf",
      "LLaMAX2-7B",
      "LLaMAX2-7B-Alpaca",
      "mala-500-10b-v2",
      "mala-500-10b-v1",
      "TowerInstruct-7B-v0.2",
      "TowerBase-7B-v0.1",
      "bloom-7b1",
      "bloomz-7b1",
      "mGPT",
      "mGPT-13B",
      "yayi-7b-llama2",
      "yayi-7b",
      "occiglot-7b-eu5",
      "occiglot-7b-eu5-instruct",
      "Meta-Llama-3-8B",
      "Meta-Llama-3.1-8B",
      "gemma-2-9b",
      "gemma-7b",
      "Qwen2-7B",
      "Qwen1.5-7B",
    ],

    BELEBELE: [
      "Llama 2 7B",
      "Llama 2 7B Chat",
      "CodeLlama 2 7B",
      "LLaMAX Llama 2 7B",
      "LLaMAX Llama 2 7B",
      "MaLA-500 Llama 2 10B v1",
      "MaLA-500 Llama 2 10B v2",
      "YaYi Llama 2 7B",
      "TowerBase Llama 2 7B",
      "TowerInstruct Llama 2 7B",
      "Occiglot Mistral 7B v0.1",
      "Occiglot Mistral 7B v0.1 Instruct",
      "BLOOM 7B",
      "BLOOMZ 7B",
      "mGPT",
      "XGLM 7.5B",
      "YaYi 7B",
      "Llama 3 8B",
      "Llama 3.1 8B",
      "Gemma 7B",
      "Gemma 2 9B",
      "Qwen 2 7B",
      "Qwen 1.5 7B",
      "EMMA-500 Llama 2 7B",
    ],

    arc_multilingual: [
      "Llama 2 7B Chat",
      "CodeLlama 2 7B",
      "LLaMAX Llama 2 7B",
      "LLaMAX Llama 2 7B Alpaca",
      "MaLA-500 Llama 2 10B v1",
      "MaLA-500 Llama 2 10B v2",
      "YaYi Llama 2 7B",
      "TowerBase Llama 2 7B",
      "TowerInstruct Llama 2 7B",
      "Occiglot Mistral 7B v0.1",
      "Occiglot Mistral 7B v0.1 Instruct",
      "BLOOM 7B",
      "BLOOMZ 7B",
      "mGPT",
      "mGPT 13B",
      "XGLM 7.5B",
      "YaYi 7B",
      "Llama 3 8B",
      "Llama 3.1 8B",
      "Llama 3.1 8B",
      "Gemma 7B",
      "Gemma 2 9B",
      "Qwen 2 7B",
      "Qwen 1.5 7B",
      "EMMA-500 Llama 2 7B",
    ],

    glot500: [
      "Llama 2 7B",
      "Llama 2 7B Chat",
      "CodeLlama 2 7B",
      "LLaMAX Llama 2 7B",
      "LLaMAX Llama 2 7B Alpaca",
      "MaLA-500 Llama 2 10B v1",
      "MaLA-500 Llama 2 10B v2",
      "TowerBase Llama 2 7B",
      "TowerInstruct Llama 2 7B",
      "Occiglot Mistral 7B v0.1",
      "Occiglot Mistral 7B v0.1 Instruct",
      "BLOOM 7B",
      "BLOOMZ 7B",
      "mGPT",
      "XGLM 7.5B",
      "Yayi 7B",
      "Mistral 7B Instruct v0.2",
      "Mistral 7B v0.1",
      "Mistral 7B v0.3",
      "Llama 3 8B",
      "Llama 3.1 8B",
      "Gemma 7B",
      "Gemma 2 9B",
      "Qwen 2 7B",
      "Qwen 1.5 7B",
      "EMMA-500 Llama 2 7B",
    ],

    pbc: [
      "Llama 2 7B",
      "Llama 2 7B Chat",
      "CodeLlama 2 7B",
      "LLaMAX Llama 2 7B",
      "LLaMAX Llama 2 7B Alpaca",
      "MaLA-500 Llama 2 10B v1",
      "MaLA-500 Llama 2 10B v2",
      "TowerBase Llama 2 7B",
      "TowerInstruct Llama 2 7B",
      "Occiglot Mistral 7B v0.1",
      "Occiglot Mistral 7B v0.1 Instruct",
      "BLOOM 7B",
      "BLOOMZ 7B",
      "mGPT",
      "XGLM 7.5B",
      "Yayi 7B",
      "Mistral 7B Instruct v0.2",
      "Mistral 7B v0.1",
      "Mistral 7B v0.3",
      "Llama 3 8B",
      "Llama 3.1 8B",
      "Gemma 7B",
      "Gemma 2 9B",
      "Qwen 2 7B",
      "Qwen 1.5 7B",
      "EMMA-500 Llama 2 7B",
    ],
  };

  useEffect(() => {
    if (selectedBenchmarks.length) {
      const benchmark = selectedBenchmarks[selectedBenchmarks.length - 1];
      let dataFile;
      if (benchmark === "SIB-200") dataFile = "/metrics/SIB-200.csv";
      else if (benchmark === "Taxi-1500") dataFile = "/metrics/Taxi-1500.csv";
      else if (benchmark === "Flores-200-Eng-X-BLEU")
        dataFile = "/metrics/Flores-200-Eng-X-BLEU.csv";
      else if (benchmark === "Flores-200-Eng-X-chrf")
        dataFile = "/metrics/Flores-200-Eng-X-chrF.csv";
      else if (benchmark === "Flores-200-X-Eng-BLEU")
        dataFile = "/metrics/Flores-200-X-Eng-BLEU.csv";
      else if (benchmark === "Flores-200-X-Eng-chrf")
        dataFile = "/metrics/Flores-200-X-Eng-chrF.csv";
      else if (benchmark === "XL-Sum-BERTScore")
        dataFile = "/metrics/XL-Sum-BERTScore.csv";
      else if (benchmark === "XL-Sum-ROUGE")
        dataFile = "/metrics/XL-Sum-ROUGE.csv";
      else if (benchmark === "Aya-BLEU") dataFile = "/metrics/Aya-BLEU.csv";
      else if (benchmark === "Aya-Self-BLEU")
        dataFile = "/metrics/Aya-Self-BLEU.csv";
      else if (benchmark === "PolyWrite") dataFile = "/metrics/PolyWrite.csv";
      else if (benchmark === "BELEBELE") dataFile = "/metrics/belebele.csv";
      else if (benchmark === "arc_multilingual")
        dataFile = "/metrics/arc_multilingual.csv";
      else if (benchmark === "glot500") dataFile = "/metrics/nll_glot500.csv";
      else dataFile = "/metrics/nll_pbc.csv";

      fetch(dataFile)
        .then((response) => response.text())
        .then((csvText) => {
          const parsedData = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
          });
          setData(parsedData.data);
        })
        .catch((error) => {
          console.error("Error fetching the CSV file:", error);
        });
    }
  }, [selectedBenchmarks]);

  const handleTaskChange = (task) => {
    const newTasks = selectedTasks.includes(task)
      ? selectedTasks.filter((t) => t !== task)
      : [...selectedTasks, task];
    setSelectedTasks(newTasks);

    // Change of Tasks after reset
    if (!newTasks.length) {
      setSelectedBenchmarks([]);
      setSelectedModels([]);
      setSelectedCategories([]);
      setSelectedValues([]);
      setSelectedLanguages([]);
    }
  };

  const handleBenchmarkChange = (benchmark) => {
    const newBenchmarks = selectedBenchmarks.includes(benchmark)
      ? selectedBenchmarks.filter((b) => b !== benchmark)
      : [...selectedBenchmarks, benchmark];
    setSelectedBenchmarks(newBenchmarks);

    if (newBenchmarks.length > 0) {
      setSelectedBenchmark(newBenchmarks[0]);
    } else {
      setSelectedBenchmark(null);
    }

    setSelectedModels([]);
    setSelectedCategories([]);
    setSelectedValues([]);
    setSelectedLanguages([]);
  };

  const handleModelChange = (model) => {
    const newModels = selectedModels.includes(model)
      ? selectedModels.filter((m) => m !== model)
      : [...selectedModels, model];
    setSelectedModels(newModels);
    setSelectedCategories([]);
    setSelectedValues([]);
    setSelectedLanguages([]);
  };

  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    setSelectedValues([]);
    setSelectedLanguages([]);
  };

  const handleValueChange = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setSelectedValues(newValues);
    setSelectedLanguages([]);
  };

  const handleLanguageChange = (language) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l) => l !== language)
      : [...selectedLanguages, language];
    setSelectedLanguages(newLanguages);
  };

  // Extracts models from the selected benchmark
  const labels =
    selectedBenchmark && performance[selectedBenchmark]
      ? Object.keys(performance[selectedBenchmark]).filter((model) =>
          selectedModels.includes(model)
        )
      : [];

  const handleSubmit = () => {
    if (
      selectedCategories.includes("performance") &&
      selectedModels.length > 0 &&
      selectedBenchmark
    ) {
      const benchmarkData = performance?.[selectedBenchmark];

      if (!benchmarkData) {
        console.error(`Benchmark "${selectedBenchmark}" does not exist.`);
        alert(`Benchmark "${selectedBenchmark}" does not exist.`);
        return;
      }

      const filteredModels = selectedModels.filter(
        (model) => benchmarkData[model]
      );

      if (filteredModels.length === 0) {
        console.error("No valid models in the selected benchmark.");
        alert("No valid models found in the selected benchmark.");
        return;
      }

      const firstModel = Object.keys(benchmarkData)[0];

      const dynamicLabels = firstModel
        ? Object.keys(benchmarkData[firstModel])
        : [];

      const labels = Object.keys(benchmarkData).filter((model) =>
        selectedModels.includes(model)
      );

      const datasets = dynamicLabels.map((range, index) => ({
        label: range,
        data: labels.map((model) => benchmarkData?.[model]?.[range] ?? 0),
        backgroundColor: ["#eb7134", "#3486eb", "#ebdb34"][index % 5],
        stack: "Stack 0",
      }));

      // Validates dataset before setting the state
      if (
        !Array.isArray(labels) ||
        labels.length === 0 ||
        datasets.some((d) => !Array.isArray(d.data))
      ) {
        console.error("Chart labels or datasets are not valid arrays.");
        return;
      }

      // Updated Chart
      setChartData({ labels, datasets });
      setShowChart(true);
      setShowTable(false); // Hides the table while chart is being shown.
    } else {
      const filteredData = data.filter(
        (item) =>
          selectedModels.includes(item.Models) &&
          selectedLanguages.some((lang) => item[lang] !== "N/A")
      );

      setShowTable(true);
      setData(filteredData);
      setShowChart(false);
    }
  };

  const chartOptions = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Performance Distribution" },
      datalabels: {
        anchor: "center",
        align: "center",
        color: "#00000",
        font: { weight: "normal", size: 14 },
        formatter: (value) => (value > 0 ? value : ""),
      },
    },
    scales: {
      x: { beginAtZero: true, stacked: true },
      y: { stacked: true },
    },
  };

  const getLanguagesCategoryValue = (category, value) => {
    const languages = selectedBenchmarks.flatMap((benchmark) => {
      const categoryData =
        benchmarkLanguages[benchmark]?.[category]?.[value] || [];
      return categoryData;
    });

    const allLanguages = selectedBenchmarks.flatMap(
      (benchmark) => benchmarkLanguages[benchmark]?.languages || []
    );

    return Array.from(new Set([...languages, ...allLanguages]));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" sx={{ bgcolor: "#333" }}></AppBar>

      <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
        <Box sx={{ width: "25%", p: 2, overflowY: "auto" }}>
          <Box
            sx={{
              bgcolor: "white",
              p: 2,
              borderRadius: 1,
              color: "black",
              width: "100%",
            }}
          >
            <Typography variant="h6">Tasks</Typography>
            {[...Object.keys(taskBenchmarks)].map((task) => (
              <FormControlLabel
                key={task}
                control={
                  <Checkbox
                    checked={selectedTasks.includes(task)}
                    onChange={() => handleTaskChange(task)}
                    color="primary"
                  />
                }
                label={task}
              />
            ))}

            {selectedTasks.length > 0 && (
              <Box>
                <Typography variant="h6">Benchmarks</Typography>
                {selectedTasks.flatMap((task) =>
                  taskBenchmarks[task].map((benchmark) => (
                    <FormControlLabel
                      key={benchmark}
                      control={
                        <Checkbox
                          checked={selectedBenchmarks.includes(benchmark)}
                          onChange={() => handleBenchmarkChange(benchmark)}
                          color="primary"
                        />
                      }
                      label={benchmark}
                    />
                  ))
                )}
              </Box>
            )}

            {selectedBenchmarks.length > 0 && (
              <Box>
                <Typography variant="h6">Models</Typography>
                {selectedBenchmarks.flatMap((benchmark) =>
                  benchmarkModels[benchmark].map((model) => (
                    <FormControlLabel
                      key={model}
                      control={
                        <Checkbox
                          checked={selectedModels.includes(model)}
                          onChange={() => handleModelChange(model)}
                          color="primary"
                        />
                      }
                      label={model}
                    />
                  ))
                )}
              </Box>
            )}

            {selectedModels.length > 0 && (
              <Box>
                <Typography variant="h6">Categories</Typography>
                {[
                  "Resources (MALA)",
                  "Writing Systems",
                  "performance",
                  "Resources (Joshi)",
                ].map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        color="primary"
                      />
                    }
                    label={category}
                  />
                ))}
              </Box>
            )}

            {selectedCategories.length > 0 && (
              <Box>
                <Typography variant="h6">Values</Typography>

                {/* Resources (MALA) */}
                {selectedCategories.includes("Resources (MALA)") &&
                  selectedBenchmarks.map((benchmark) => {
                    const ResourcesMALA = Object.keys(
                      benchmarkLanguages[benchmark]?.ResourcesMALA || {}
                    );
                    return ResourcesMALA.map((value) => (
                      <Box key={value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedValues.includes(value)}
                              onChange={() => handleValueChange(value)}
                              color="primary"
                            />
                          }
                          label={value}
                        />

                        {selectedValues.includes(value) &&
                          benchmarkLanguages[benchmark]?.ResourcesMALA[
                            value
                          ]?.map((lang) => (
                            <Box ml={4} key={lang}>
                              {" "}
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedLanguages.includes(lang)}
                                    onChange={() => handleLanguageChange(lang)}
                                    color="primary"
                                  />
                                }
                                label={lang}
                              />
                            </Box>
                          ))}
                      </Box>
                    ));
                  })}

                {/* Writing Systems */}
                {selectedCategories.includes("Writing Systems") &&
                  selectedBenchmarks.map((benchmark) => {
                    const writingSystems = Object.keys(
                      benchmarkLanguages[benchmark]?.writingSystems || {}
                    );
                    return writingSystems.map((value) => (
                      <Box key={value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedValues.includes(value)}
                              onChange={() => handleValueChange(value)}
                              color="primary"
                            />
                          }
                          label={value}
                        />

                        {selectedValues.includes(value) &&
                          benchmarkLanguages[benchmark]?.writingSystems[
                            value
                          ]?.map((lang) => (
                            <Box ml={4} key={lang}>
                              {" "}
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedLanguages.includes(lang)}
                                    onChange={() => handleLanguageChange(lang)}
                                    color="primary"
                                  />
                                }
                                label={lang}
                              />
                            </Box>
                          ))}
                      </Box>
                    ));
                  })}

                {/* Performance */}

                {selectedCategories.includes("performance") && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                  >
                    Submit
                  </Button>
                )}

                {/* Resources (Joshi) */}

                {selectedCategories.includes("Resources (Joshi)") &&
                  selectedBenchmarks.map((benchmark) => {
                    const ResourcesJoshi = Object.keys(
                      benchmarkLanguages[benchmark]?.ResourcesJoshi || {}
                    );
                    return ResourcesJoshi.map((value) => (
                      <Box key={value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedValues.includes(value)}
                              onChange={() => handleValueChange(value)}
                              color="primary"
                            />
                          }
                          label={value}
                        />

                        {selectedValues.includes(value) &&
                          benchmarkLanguages[benchmark]?.ResourcesJoshi[
                            value
                          ]?.map((lang) => (
                            <Box ml={4} key={lang}>
                              {" "}
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedLanguages.includes(lang)}
                                    onChange={() => handleLanguageChange(lang)}
                                    color="primary"
                                  />
                                }
                                label={lang}
                              />
                            </Box>
                          ))}
                      </Box>
                    ));
                  })}

                {selectedCategories.includes("languages") &&
                  selectedBenchmarks.map((benchmark) => {
                    const languagesUnderResourcesMALA = Object.keys(
                      benchmarkLanguages[benchmark]?.ResourcesMALA || {}
                    ).flatMap(
                      (resource) =>
                        benchmarkLanguages[benchmark]?.ResourcesMALA[resource]
                    );
                    const languagesUnderWritingSystems = Object.keys(
                      benchmarkLanguages[benchmark]?.writingSystems || {}
                    ).flatMap(
                      (system) =>
                        benchmarkLanguages[benchmark]?.writingSystems[system]
                    );
                    const languagesUnderPerformance = Object.keys(
                      benchmarkLanguages[benchmark]?.performance || {}
                    ).flatMap(
                      (perf) => benchmarkLanguages[benchmark]?.performance[perf]
                    );
                    const languagesUnderResourcesJoshi = Object.keys(
                      benchmarkLanguages[benchmark]?.ResourcesJoshi || {}
                    ).flatMap(
                      (system) =>
                        benchmarkLanguages[benchmark]?.ResourcesJoshi[system]
                    );

                    const allLanguages = [
                      ...new Set([
                        ...languagesUnderResourcesMALA,
                        ...languagesUnderWritingSystems,
                        ...languagesUnderPerformance,
                        ...languagesUnderResourcesJoshi,
                      ]),
                    ];

                    return allLanguages.map((lang) => (
                      <Box ml={4} key={lang}>
                        {" "}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedLanguages.includes(lang)}
                              onChange={() => handleLanguageChange(lang)}
                              color="primary"
                            />
                          }
                          label={lang}
                        />
                      </Box>
                    ));
                  })}
              </Box>
            )}

            {selectedLanguages.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 2 }}
              >
                Submit
              </Button>
            )}
          </Box>
        </Box>

        {/* Table */}

        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          {showTable && (
            <TableData
              results={data}
              selectedModels={selectedModels}
              selectedLanguages={selectedLanguages}
            />
          )}
        </Box>

        {/* Chart */}

        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          {showChart && chartData && (
            <Bar data={chartData} options={chartOptions} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Metrics;
