Metrics
================

The ``Matrics`` component allows users to select Task, Benchmark, Models, Category, Value, Languages and submit.

   **Features:**

   1. **User Selection**
      - Users can able to select Task, Benchmark, Models, Category, Value, Languages.

   2. **Bar Graph**
      - After Selecting performance in categories and submit, a Bar Graph will be displayed with performance bins.

  
   **Component Structure:**

   .. code-block:: text

      Metrics.jsx
      ├── Table.jsx (Handles displaying data in Tabular format)
      ├── benchmarkLanguages.js (Languages of Resources (MALA), Writing Systems, Resources 
          (Joshi) are stored)
      ├── performance.js (Values of performance bins are stored)


   **State Variables:**
   
   - ``selectedTasks``: Stores selected Tasks.
   - ``selectedBenchmarks``: Stores selected Benchmarks.
   - ``selectedModels``: Stores selected Models.
   - ``selectedCategories``: Stores selected Categories.
   - ``selectedValues``: Stores selected Values.
   - ``data``: Stores evalaution scores.
   - ``showTable``: If showTable is true, data from Resources (MALA), Writing Systems and 
       Resources (Joshi) are displayed.

   **User Actions:**

   - ``handleTaskChange(task)``: Function for selecting and Deselecting Tasks.
   - ``handleBenchmarkChange(benchmark)``: Function for Selecting and Deselecting Benchmarks.
   - ``handleModelChange(model)``: Function for selecting and deselecting Models.
   - ``handleCategoryChange(category)``: Function for selecting and deselecting Categories.
   - ``handleValueChange(value)``: Function for selecting and deselecting Values.
   - ``handleLanguageChange(language)``: Function for selecting and deselecting Languages.
   - ``handleSelectAllResourcesMALA(benchmark, value)``: Function for selecting all Languages associated with Resources (MALA).
   - ``handleSelectAllWritingSystems(benchmark, value)``: Function for selecting all Languages associated with Writing Systems.
   - ``handleSelectAllResourcesJoshi(benchmark, value)``: Function for selecting all Languages associated with Resources (Joshi).
   - ``handleSubmit()``: Function for handling Submit button.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (AppBar, Typography, Box, FormControlLabel, Checkbox, Button UI Components)
