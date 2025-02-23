Translator
=================

.. code-block:: js

    import React from 'react';
    import { Translator } from 'react-translation';

    const Translator = ({ textToTranslate, row, taskType, showTextField }) => {
        return (

TranslatorOutside
=================

.. code-block:: js

    import React from 'react';
    import { Translator } from 'react-translation';

    const TranslatorOutside = ({ row, taskType }) => {
        return (
            <Translator
                row={row}
                taskType={taskType}