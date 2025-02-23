APIs
==========

Authentication Endpoints
------------------------
POST /api/signup: Registers a new user with a username and password.

POST /api/login: Authenticates a user and starts a session.

POST /api/logout: Ends the user session.

Task Configuration Endpoint
---------------------------

GET /api/tasks: Retrieves the task configuration from a JSON file.

Data Loading Endpoint
---------------------

POST /api/data: Loads data from a JSONL file based on task type, benchmark, model, and language parameters.

Annotation Endpoint
-------------------

POST /api/annotation: Saves annotations made by the user. It can handle multiple annotations at once.

Comments Endpoints
------------------

GET /api/comments: Retrieves all comments, optionally filtered by entry ID.

POST /api/comments: Adds a new comment.

PUT /api/comments/int:comment_id: Updates an existing comment.

DELETE /api/comments/int:comment_id: Deletes a comment.

POST /api/comments/thumbs: Records a thumbs-up or thumbs-down vote for a comment.

Export Endpoint
-----------------

GET /api/export: Exports both annotations and comments as a JSON file.

Translation Endpoint
------------------

POST /api/translate: Translates text to a specified target language using Google Translate.

Feedback Endpoint
------------------

POST /api/feedback: Retrieves feedback for a specific entry ID and username.