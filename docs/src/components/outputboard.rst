Output Board
============

The ``OutputBoard`` component serves as the main interface for human evaluation and feedback collection.
It allows users to select tasks, benchmarks, models, and languages, load data for evaluation, 
provide feedback, and navigate through entries for assessment.

.. function:: OutputBoard({ user })

   :param user: The authenticated user providing feedback.
   :type user: object
   :returns: A React component rendering the evaluation board.
   :rtype: JSX.Element

   **Features:**

   1. **Task Selection**
      - Users select a **task**, **benchmark**, **model**, and **language** using the `TaskSelector` component.
      - The selections are retrieved from the URL if available.

   2. **Data Fetching**
      - Upon selection, the component sends a POST request to the API (`/api/data`).
      - Data is stored in the `tableData` state and displayed using the `DataTable` component.

   3. **Feedback Submission**
      - Users can click on a row to open the `FeedbackSidebar`.
      - Feedback is saved to the backend API (`/api/feedback`).

   4. **One-by-One Evaluation**
      - Users can evaluate entries one by one using a dialog with **Next**, **Back**, and **Skip To** controls.
      - Previously submitted feedback is retrieved for each entry.

   **Component Structure:**

   .. code-block:: text

      OutputBoard.js
      ├── TaskSelector.js (Handles task selection)
      ├── DataTable.js (Displays the data for evaluation)
      ├── FeedbackSidebar.js (Handles user feedback submission)
      ├── CommentSection.js (Displays previous comments)
      ├── API Calls (/api/tasks, /api/data, /api/feedback)

   **Example Usage:**

   .. code-block:: jsx

      <OutputBoard user={currentUser} />

   **API Endpoints:**

   - ``GET /api/tasks``: Fetches available tasks and benchmarks.
   - ``POST /api/data``: Loads data based on selected task, benchmark, model, and language.
   - ``POST /api/feedback``: Submits feedback for a specific data entry.

   **State Variables:**
   
   - ``selectedTask``: The currently selected task.
   - ``selectedBenchmark``: The selected benchmark dataset.
   - ``selectedModel``: The selected model for evaluation.
   - ``selectedLanguage``: The language selected for evaluation.
   - ``tableData``: The dataset loaded from the API.
   - ``selectedRow``: The row currently selected for feedback.
   - ``userFeedback``: The previously submitted feedback for an entry.

   **Navigation & User Actions:**

   - ``handleEvaluateOneByOne()``: Opens a modal for step-by-step evaluation.
   - ``handleRowSelect(row)``: Opens the feedback sidebar for a selected row.
   - ``handleLoadData()``: Fetches evaluation data based on user selection.
   - ``handleNext()``: Moves to the next entry in step-by-step evaluation.
   - ``handleBack()``: Moves to the previous entry.
   - ``handleSkipTo()``: Jumps to a specific entry number.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (UI components for layout, dialogs, buttons)
   - ``react-router-dom`` (Handles URL parameters for task selection)
   - ``../services/api`` (API calls for data retrieval)
   - ``TaskSelector`` (Handles user selection of tasks and models)
   - ``DataTable`` (Displays fetched data in a structured format)
   - ``FeedbackSidebar`` (Handles user feedback submission)
   - ``CommentSection`` (Displays previous user comments)

---------------------------------------------------------------------------------------

Variant: Output Board Section
----------------------------
``OutputBoardSection`` is a variant of ``OutputBoard``, primarily used in **Data Visualization** to display results below the selected model chart. 
Therefore, the task, benchmark, and model are selected in previous steps and passed as parameters to this component. 
It fetches available languages dynamically and enables navigation
to the human feedback section.

.. function:: OutputBoardSection({ task, benchmark, model })

   :param task: The selected task type (e.g., classification, translation, summarization).
   :type task: str
   :param benchmark: The selected benchmark dataset.
   :type benchmark: str
   :param model: The selected model under evaluation.
   :type model: str
   :returns: A React component rendering the output viewing section.
   :rtype: JSX.Element

 **Component Structure:**

     .. code-block:: text

        OutputBoardSection.js
        ├── DataTable.js (Displays model-generated outputs)
        ├── API Calls (/api/tasks, /api/data)
        ├── React Router (Navigation to /human-feedback)

 **Example Usage:**

     .. code-block:: js

        <OutputBoardSection task="translation" benchmark="Flores-200" model="LLaMA-2" />

 **API Endpoints:**

    - ``GET /api/tasks``: Fetches available tasks, benchmarks, and model information.
    - ``POST /api/data``: Loads outputs based on selected task, benchmark, model, and language.

 **State Variables:**

   - ``selectedLanguage``: The currently selected language for evaluation.
   - ``tableData``: The dataset containing model-generated outputs.
   - ``availableLanguages``: List of available languages for the selected model.

 **Navigation & User Actions:**

   - ``handleLoadData()``: Fetches model-generated outputs for the selected language.
   - ``handleNavigateToHumanFeedback()``: Navigates to the Human Feedback section.
