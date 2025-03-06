API
==========
Base Information
-------------------
- **Base URL**: ``http://<your-server-address>/api``
- **Data Format**: JSON
- **Authentication**: JWT (user login state is managed via ``session``)

------------------------

User Authentication
------------------------

User Signup
^^^^^^^^^^^^^
- **URL**: ``/api/signup``
- **Method**: ``POST``
- **Request Body**:
 
  .. code-block:: json

     {
       "username": "your_username",
       "password": "your_password"
     }

- **Success Response**:
 
  .. code-block:: json

     {
       "message": "User created",
       "username": "your_username"
     }

- **Error Responses**:
   - ``400``: Missing username or password
   - ``400``: Username already exists


User Login
^^^^^^^^^^^^
- **URL**: ``/api/login``
- **Method**: ``POST``
- **Request Body**:

  .. code-block:: json

     {
       "username": "your_username",
       "password": "your_password"
     }

- **Success Response**:

  .. code-block:: json

     {
       "message": "Logged in",
       "username": "your_username"
     }

- **Error Responses**:
   - ``400``: Missing username or password
   - ``401``: Invalid username or password


User Logout
^^^^^^^^^^^^^
- **URL**: ``/api/logout``
- **Method**: ``POST``
- **Success Response**:
  
  .. code-block:: json

     {
       "message": "Logged out"
     }

------------------------

Task Configuration
----------------------

Get Task Configuration
^^^^^^^^^^^^^^^^^^^^^^^^
- **URL**: ``/api/tasks``
- **Method**: ``GET``
- **Success Response**:
  
  .. code-block:: json

     {
       "task_type_1": {
         "benchmark_1": {
           "model_1": ["language_1", "language_2"]
         }
       }
     }

- **Error Response**:
   - ``500``: Failed to load task configuration

------------------------

Data Loading
-----------------

Get Data
^^^^^^^^^^
- **URL**: ``/api/data``
- **Method**: ``POST``
- **Request Body**:
  
  .. code-block:: json

     {
       "task": "task_type",
       "benchmark": "benchmark_name",
       "model": "model_name",
       "language": "language_code"
     }

- **Success Response**:
  
  .. code-block:: json

     [
       {
         "entry_id": "task-benchmark-model-language-0001",
         "field_1": "value_1",
         "field_2": "value_2"
       }
     ]

- **Error Responses**:
   - ``400``: Missing parameters
   - ``404``: Data file not found
   - ``500``: Failed to read file

------------------------

Annotations
----------------

Save Annotation
^^^^^^^^^^^^^^^^^
- **URL**: ``/api/annotation``
- **Method**: ``POST``
- **Request Body**:
  
  .. code-block:: json

     {
       "entry_id": "task-benchmark-model-language-0001",
       "row_data": { ... },
       "annotations": [
         {
           "errorType": "error_type",
           "start": 0,
           "end": 10
         }
       ]
     }

- **Success Response**:
  
  .. code-block:: json

     {
       "message": "X annotations saved."
     }

- **Error Responses**:
   - ``401``: Unauthenticated
   - ``500``: Database error

------------------------

Comments
-------------

Get Comments
^^^^^^^^^^^^^^
- **URL**: ``/api/comments``
- **Method**: ``GET``
- **Success Response**:
  
  .. code-block:: json

     [
       {
         "id": 1,
         "username": "user1",
         "entry_id": "task-benchmark-model-language-0001",
         "question": "What is this?",
         "feedback": "This is a comment.",
         "rating": 5,
         "timestamp": "2023-10-01T12:00:00Z"
       }
     ]


Add Comment
^^^^^^^^^^^^^
- **URL**: ``/api/comments``
- **Method**: ``POST``
- **Request Body**:
  
  .. code-block:: json

     {
       "entry_id": "task-benchmark-model-language-0001",
       "row_data": { ... },
       "question": "What is this?",
       "feedback": "This is a comment.",
       "rating": 5
     }

- **Success Response**:
  
  .. code-block:: json

     {
       "message": "Comment added",
       "id": 1
     }


Edit Comment
^^^^^^^^^^^^^^
- **URL**: ``/api/comments/<comment_id>``
- **Method**: ``PUT``
- **Request Body**:
  
  .. code-block:: json

     {
       "question": "Updated question",
       "feedback": "Updated feedback",
       "rating": 4
     }

- **Success Response**:
  
  .. code-block:: json

     {
       "message": "Comment updated"
     }


Delete Comment
^^^^^^^^^^^^^^^^
- **URL**: ``/api/comments/<comment_id>``
- **Method**: ``DELETE``
- **Success Response**:

  .. code-block:: json

     {
       "message": "Comment deleted"
     }

------------------------

Translation
----------------

Translate Text
^^^^^^^^^^^^^^^^
- **URL**: ``/api/translate``
- **Method**: ``POST``
- **Request Body**:

  .. code-block:: json

     {
       "text": "Text to translate",
       "target_lang": "es"
     }

- **Success Response**:

  .. code-block:: json

     {
       "translated_text": "Translated text",
       "target_lang": "es"
     }

- **Error Responses**:
   - ``400``: Missing text or unsupported target language
   - ``500``: Translation failed

------------------------

Data Export
---------------

Export Data
^^^^^^^^^^^^^
- **URL**: ``/api/export``
- **Method**: ``GET``
- **Response**: Returns a JSON file containing all annotations and comments.

------------------------

Feedback
------------

Get Feedback
^^^^^^^^^^^^^^
- **URL**: ``/api/feedback``
- **Method**: ``POST``
- **Request Body**:

  .. code-block:: json

     {
       "entry_id": "task-benchmark-model-language-0001",
       "username": "user1"
     }

- **Success Response**:

  .. code-block:: json

     {
       "id": 1,
       "username": "user1",
       "entry_id": "task-benchmark-model-language-0001",
       "question": "What is this?",
       "comment": "This is a comment.",
       "rating": 5,
       "timestamp": "2023-10-01T12:00:00Z"
     }

- **Error Responses**:
   - ``400``: Missing parameters
   - ``404``: Feedback not found
