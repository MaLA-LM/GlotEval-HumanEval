Architecture
============

The architecture of the system is as follows:

Frontend
------

The frontend is built using React, a popular JavaScript library for building user interfaces. React allows developers to build reusable UI components and manage the state of the application using Redux, a state management library. 

UI
~~~~~~~~~~~

The frontend is also built using Material-UI (MUI), a popular React UI framework that provides a set of pre-built components that can be used to build a responsive and modern user interface.

Components
~~~~~~~~~~~
For details about the components used in the frontend, please refer to the :doc:`components` section.


Backend
-------

The backend is built using Python Flask. It is responsible for handling API requests and returning responses to the frontend. The backend uses SQLite as the database to store user data and other information.

Database
~~~~~~~~~~~

The database is SQLit, which is a NoSQL database. It is used to store user data, such as user profiles, preferences, and other information. The database is accessed by the backend through Mongoose, which is an Object Data Modeling (ODM) library for MongoDB and Node.js.

API
~~~~~~~~~~~

The system provides RESTful APIs for the frontend to interact with the backend. The APIs are built using Express and are responsible for handling API requests and returning responses to the frontend. The APIs are secured using JWT (JSON Web Tokens) for authentication and authorization.

File system
~~~~~~~~~~~
The file system is a key component of the backend. It is responsible for storing and retrieving files from the database. The file system is implemented using the SQLAlchemy ORM and the Flask-Uploads extension.

The file system is used to store files that are uploaded by users. The files are stored in the database as binary data. The file system also provides a way to retrieve the files from the database and serve them to the user.