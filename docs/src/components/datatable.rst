Data table
================

The ``DataTable`` component displays structured data in a table format, 
supports pagination, filtering, and provides an expandable row for additional actions.

.. function:: DataTable({ data, onRowSelect, taskType, columnOrder, isViewMode })

   :param data: The dataset to be displayed.
   :type data: array of objects
   :param onRowSelect: Function to handle row selection for feedback submission.
   :type onRowSelect: function
   :param taskType: The type of task (e.g., classification, translation).
   :type taskType: str
   :param columnOrder: The order of columns to display.
   :type columnOrder: array of str
   :param isViewMode: Whether the table is in read-only mode (default: False).
   :type isViewMode: bool
   :returns: A React component rendering a dynamic table.
   :rtype: JSX.Element

   **Features:**

   1. **Column Ordering**
      - If `columnOrder` is provided, it defines the display order of columns.
      - If not, it automatically derives column headers from `data`.

   2. **Pagination**
      - Uses `TablePagination` to handle large datasets efficiently.
      - Supports `rowsPerPage` selection.

   3. **Filtering (Classification Task Only)**
      - Uses `CategoryFilter` to filter by **predicted** and **correct** categories.
      - Filters apply dynamically without page reload.

   4. **Row Expansion**
      - Clicking a row expands additional information.
      - Displays a **translation tool** (`TranslatorOutside`).
      - Provides a **feedback button** when `isViewMode` is `False`.

   **Component Structure:**

   .. code-block:: text

      DataTable.js
      ├── CategoryFilter.js (Handles classification filtering)
      ├── TranslatorOutside.js (Handles inline translations)
      ├── API Calls (/api/data)
      ├── Pagination and Filtering

   **Example Usage:**

   .. code-block:: jsx

      <DataTable 
         data={tableData} 
         onRowSelect={handleRowSelection} 
         taskType="classification" 
         columnOrder={["model_name", "test_lang", "predicted_category"]} 
         isViewMode={false} 
      />

   **State Variables:**
   
   - ``page``: The current pagination page.
   - ``rowsPerPage``: The number of rows displayed per page.
   - ``filters``: Stores selected filtering options.
   - ``expandedRow``: Tracks the row currently expanded.

   **User Actions:**

   - ``handleChangePage(event, newPage)``: Updates the pagination page.
   - ``handleChangeRowsPerPage(event)``: Changes the number of displayed rows.
   - ``handleExpandClick(row)``: Expands or collapses additional row details.
   - ``onRowSelect(row)``: Triggers the feedback function.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (Table UI components)
   - ``CategoryFilter`` (Filters classification results)
   - ``TranslatorOutside`` (Inline translation functionality)
