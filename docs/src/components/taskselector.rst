Task Selector
==================

The ``TaskSelector`` component provides a dropdown-based interface for users to select 
a task, benchmark, model, and language. It dynamically updates available options based 
on user selection and the provided ``tasksConfig`` data.

.. function:: TaskSelector({ tasksConfig, selectedTask, setSelectedTask, selectedBenchmark, setSelectedBenchmark, selectedModel, setSelectedModel, selectedLanguage, setSelectedLanguage })

   :param tasksConfig: The available tasks, benchmarks, models, and languages.
   :type tasksConfig: object
   :param selectedTask: The currently selected task.
   :type selectedTask: str
   :param setSelectedTask: Function to update the selected task.
   :type setSelectedTask: function
   :param selectedBenchmark: The currently selected benchmark.
   :type selectedBenchmark: str
   :param setSelectedBenchmark: Function to update the selected benchmark.
   :type setSelectedBenchmark: function
   :param selectedModel: The currently selected model.
   :type selectedModel: str
   :param setSelectedModel: Function to update the selected model.
   :type setSelectedModel: function
   :param selectedLanguage: The currently selected language.
   :type selectedLanguage: str
   :param setSelectedLanguage: Function to update the selected language.
   :type setSelectedLanguage: function
   :returns: A React component rendering the task selection interface.
   :rtype: JSX.Element

   **Features:**

   1. **Task Selection**
      - Users select a **task** from a dropdown (`<Select>`).
      - Selecting a task resets the benchmark, model, and language.

   2. **Benchmark Selection**
      - Users choose a benchmark dataset from the available options for the selected task.
      - Selecting a benchmark resets the model and language.

   3. **Model Selection**
      - Users select a model from the available models for the chosen benchmark.
      - Selecting a model resets the language.

   4. **Language Selection**
      - Users select a language from the available options for the selected model.

   **Component Structure:**

   .. code-block:: text

      TaskSelector.js
      ├── API Calls (/api/tasks)
      ├── Dynamic Selection (Task → Benchmark → Model → Language)

   **Example Usage:**

   .. code-block:: js

      <TaskSelector 
         tasksConfig={tasksData} 
         selectedTask={selectedTask} 
         setSelectedTask={setSelectedTask} 
         selectedBenchmark={selectedBenchmark} 
         setSelectedBenchmark={setSelectedBenchmark} 
         selectedModel={selectedModel} 
         setSelectedModel={setSelectedModel} 
         selectedLanguage={selectedLanguage} 
         setSelectedLanguage={setSelectedLanguage} 
      />

   **State Variables:**
   
   - ``selectedTask``: The currently selected task.
   - ``selectedBenchmark``: The selected benchmark dataset.
   - ``selectedModel``: The selected model for evaluation.
   - ``selectedLanguage``: The language selected for evaluation.

   **Navigation & User Actions:**

   - ``handleTaskChange(e)``: Updates task selection and resets dependent selections.
   - ``handleBenchmarkChange(e)``: Updates benchmark selection and resets dependent selections.
   - ``handleModelChange(e)``: Updates model selection and resets language selection.
   - ``handleLanguageChange(e)``: Updates the selected language.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (UI components for dropdowns)
   - ``tasksConfig`` (Dynamic configuration for available selections)