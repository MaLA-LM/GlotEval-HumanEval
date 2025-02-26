Translator
=================

The ``Translator`` component provides text translation functionality. It allows users 
to translate either selected text or an entire dataset entry into a target language.

.. module:: Translator
   :platform: React
   :synopsis: A translation component for selected text or full data entries.

.. function:: Translator({ textToTranslate, row, taskType, showTextField })

   :param textToTranslate: The text selected for translation.
   :type textToTranslate: str
   :param row: The full dataset entry containing multiple text fields.
   :type row: object
   :param taskType: The type of task (e.g., classification, translation, summarization).
   :type taskType: str
   :param showTextField: Whether to display an editable text field (default: False).
   :type showTextField: bool
   :returns: A React component providing translation functionality.
   :rtype: JSX.Element

   **Features:**

   1. **Translation Scope Selection**
      - Users can choose between translating:
        - **Selected Text** (default behavior)
        - **Entire Entry** (all fields in a dataset row)

   2. **Multi-Language Support**
      - Provides translation to multiple languages:
        - English (`en`)
        - Spanish (`es`)
        - French (`fr`)
        - German (`de`)
        - Chinese (`zh-CN`)
        - Japanese (`ja`)
      - Selection is handled via a dropdown (`<Select>` component).

   3. **Integration with External Translation API**
      - Sends a request to `/api/translate` for translation.
      - Displays translated text in a **readonly text field**.

   **Component Structure:**

   .. code-block:: text

      Translator.js
      ├── API Calls (/api/translate)
      ├── Multi-language Dropdown
      ├── Translate Entire Entry or Selected Text
      ├── Translation Result Display

   **Example Usage:**

   .. code-block:: jsx

      <Translator 
         textToTranslate="Hello, world!" 
         row={dataRow} 
         taskType="translation" 
         showTextField={true} 
      />

   **State Variables:**
   
   - ``translationVisible``: Whether the translation result is visible.
   - ``translatedText``: Stores the translated output.
   - ``targetLanguage``: Selected language for translation.
   - ``translationScope``: Determines whether to translate the full entry or selected text.
   - ``isLoading``: Indicates if translation is in progress.
   - ``error``: Stores any errors encountered during translation.

   **User Actions:**

   - ``handleTranslate()``: Sends the selected text or full row for translation.
   - ``setTargetLanguage(value)``: Updates the selected target language.
   - ``setTranslationScope(value)``: Switches between translating selected text or the entire entry.

   **Dependencies:**
   
   - ``react`` (Component state management)
   - ``@mui/material`` (UI components: dropdowns, buttons, text fields)
   - ``api`` (Handles API calls to the backend translation service)

-----------------------------------------------------------------------------

Variant: Translator Outside
-------------------
The ``TranslatorOutside`` component is a simplified version of the ``Translator`` component, 
used to translate the selected row while viewing the output data table. 
It provides the fastest English translation service.

.. function:: TranslatorOutside({ row, taskType })

   :param row: The dataset entry containing fields to be translated.
   :type row: object
   :param taskType: The type of task (classification, translation, summarization, generation).
   :type taskType: str
   :returns: A React component rendering translation functionality.
   :rtype: JSX.Element

   **Features:**

   1. **Automatic Full-Row Translation**
      - Extracts text fields dynamically based on `taskType`.
      - Supports the following tasks:
        - **Classification** → `prompt`
        - **Translation** → `src_text`, `ref_text`, `hyp_text`, `prompt`
        - **Summarization** → `input`, `target`, `output`
        - **Generation** → `input`, `target`, `output`
      - Constructs a structured text string for translation.

   2. **Integration with External Translation API**
      - Sends a request to `/api/translate` with the extracted text.
      - Displays the translated text in a **readonly text field**.

   3. **Loading and Error Handling**
      - Shows a loading indicator while translation is in progress.
      - Displays error messages in case of API failures.

   **Component Structure:**

   .. code-block:: text

      TranslatorOutside.js
      ├── API Calls (/api/translate)
      ├── Full Dataset Entry Translation
      ├── Google Translate Button
      ├── Translation Result Display

   **Example Usage:**

   .. code-block:: jsx

      <TranslatorOutside 
         row={dataRow} 
         taskType="translation" 
      />

   **State Variables:**
   
   - ``translationVisible``: Whether the translated text is visible.
   - ``translatedText``: Stores the translated text output.
   - ``isLoading``: Indicates if translation is in progress.
   - ``error``: Stores any errors encountered during translation.

   **User Actions:**

   - ``handleTranslate()``: Extracts the text and sends a translation request.
   - ``getFullRowText(row, taskType)``: Extracts task-specific fields for translation.