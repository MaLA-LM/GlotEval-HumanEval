
Benchmark Languages
================

``benchmarkLanguages`` component contains data of Resources (MALA), Writing Systems, Resources (Joshi).

   **Data Structure:**

   - Each Benchmark contains Resources (MALA), Writing Systems and Resources (Joshi).
   - Under Resources (MALA), Languages are divided into High, Medium-High, Medium, Medium-Low, Low, Unseen.
   - Under Resources (Joshi), Languages are divided into Category 0, Category 1, Category 2, Category 3, Category 4 and Category 5.
   - Under Writing Systems, Languages are divided according to their writing systems

   **Example Structure:**

   .. code-block:: js

      export const benchmarkLanguages = {
        "SIB-200": {
          ResourcesMALA: {
            High: ["Avg", "tgk_Cyrl", "guj_Gujr", ...],
            "Medium-High": ["Avg", "amh_Ethi", "ast_Latn", ...],
            Medium: ["Avg", "fra_Latn", "glg_Latn", ...],
            "Medium-Low": ["Avg", "ace_Latn", "aka_Latn", ...],
            Low: ["Avg", "acm_Arab", "ajp_Arab"],
            Unseen: ["Avg", "ace_Arab", "acq_Arab"]
          },

          writingSystems: {
            Arabic: ["ace_Arab", ...],
            ...
          },

          ResourcesJoshi: {

             "Category 0": ["umb_Latn", ...],
             "Category 1": ["bel_Cyrl", ...],
             "Category 2": ["zul_Latn", ...],
             "Category 3": ["zsm_Latn", ...],
             "Category 4": ["vie_Latn", ...],
             "Category 5": ["spa_Latn", ...]

          }

        },

        ...

      }
