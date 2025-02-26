Category Filter
========================

The ``CategoryFilter`` component provides a filtering mechanism for predicted 
and correct categories in a dataset. It dynamically generates dropdown filters 
based on available data.

.. function:: CategoryFilter({ data, columnOrder, onFilterChange })

   :param data: The dataset containing category values.
   :type data: array of objects
   :param columnOrder: The order of columns in the dataset.
   :type columnOrder: array of str
   :param onFilterChange: Callback function to handle filter updates.
   :type onFilterChange: function
   :returns: A React component rendering category filters.
   :rtype: JSX.Element

   **Features:**

   1. **Dynamic Filtering Based on Available Columns**
      - Checks whether `predicted_category` and `correct_category` exist in `columnOrder`.
      - If present, generates dropdown menus for filtering.

   2. **Automatic Extraction of Unique Category Values**
      - Retrieves unique values from `data` for both `predicted_category` and `correct_category`.

   3. **State Management for User Selection**
      - `useState` stores the currently selected filter values.
      - `useEffect` triggers `onFilterChange` whenever filters are updated.

   **Component Structure:**

   .. code-block:: text

      CategoryFilter.js
      ├── Predicted Category Dropdown
      ├── Correct Category Dropdown
      ├── onFilterChange Callback

   **Example Usage:**

   .. code-block:: jsx

      <CategoryFilter 
         data={tableData} 
         columnOrder={["predicted_category", "correct_category"]} 
         onFilterChange={handleFilterChange} 
      />

   **State Variables:**
   
   - ``selectedPredicted``: Stores the selected predicted category.
   - ``selectedCorrect``: Stores the selected correct category.

   **User Actions:**

   - ``setSelectedPredicted(value)``: Updates the selected predicted category.
   - ``setSelectedCorrect(value)``: Updates the selected correct category.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (Dropdown UI components)