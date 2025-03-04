
Benchmark Languages
================

``performance`` component contains data of Performance.

   **Data Structure:**

   - Each Benchmark contains different Models.
   - Each Models contains performance bins.

   **Example Structure:**

   .. code-block:: js

      export const performance = {
        "SIB-200": {
          "bloom-7b1": {
             "0-0.2": 147,
             "0.2-0.5": 58,
             "0.5-1.0": 0
           
          },
          "bloomz-7b1": {
            "0-0.2": 2,
            "0.2-0.5": 203,
            "0.5-1.0": 0

          },

         "CodeLlama-7b-hf": {
           "0-0.2": 89,
           "0.2-0.5": 116,
           "0.5-1.0": 0

         },
         ...  

      },
      ...

    }
