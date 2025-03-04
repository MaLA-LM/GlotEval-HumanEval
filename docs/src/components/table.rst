Table
================

The ``Table`` component displays structured data in a table format, 
supports pagination.

.. function:: Table({ results, selectedModels, selectedLanguages })

   :param results: Evaluation scores will be displayed.
   :type results: array of objects
   :param selectedModels: Selected Models will be displayed.
   :type selectedModels: array of Objects
   :param selectedLanguages: Selected Languages will be displayed.
   :type selectedLanguages: array of Objects
   :returns: A React component rendering a dynamic table.
   :rtype: JSX.Element

   **Features:**
   
   1. **Pagination**
      - Uses `handleChangePage` to handle more than 10 rows.
      - User can click on forward and backward arrows to change the page.


   **Example Usage:**

   .. code-block:: jsx

      <TableData
        results={data}
        selectedModels={selectedModels}
        selectedLanguages={selectedLanguages}
      />

   **User Actions:**

   - ``handleChangePage(direction)``: Changes the page.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (Table UI components)
