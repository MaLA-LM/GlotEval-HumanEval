Database
=======

Structure
--------------

The database uses SQLite with SQLAlchemy ORM and consists of the following core tables:

**Users**
- Primary table for user authentication
- Fields:
  - id (Integer, Primary Key)
  - username (String, Unique)
  - password (String)

**Annotations**
- Stores text highlighting and error annotations
- Fields:
  - id (Integer, Primary Key)
  - username (String)
  - entry_id (String)
  - row_data (Text, JSON serialized)
  - error_type (String)
  - span_start (Integer)
  - span_end (Integer) 
  - timestamp (DateTime)

**Comments**
- Stores user feedback and ratings
- Fields:
  - id (Integer, Primary Key)
  - username (String)
  - entry_id (String)
  - row_data (Text, JSON serialized)
  - question (String)
  - feedback (Text)
  - rating (Integer)
  - thumbs_up (Integer)
  - thumbs_down (Integer)
  - timestamp (DateTime)

Database Schema Diagram:

.. code-block::

    +---------------+     +----------------+     +---------------+
    |    Users      |     |   Comments     |     |  Annotations  |
    +---------------+     +----------------+     +---------------+
    | id           |     | id             |     | id            |
    | username     |     | username       |     | username      |
    | password     |     | entry_id       |     | entry_id      |
    |             |     | row_data       |     | row_data      |
    |             |     | question       |     | error_type    |
    |             |     | feedback       |     | span_start    |
    |             |     | rating         |     | span_end      |
    |             |     | thumbs_up      |     | timestamp     |
    |             |     | thumbs_down    |     |               |
    |             |     | timestamp      |     |               |
    +---------------+     +----------------+     +---------------+

Name Conventions
--------------

- All table names are in plural form
- All column names are in snake_case
- Primary keys are named 'id'
- Timestamp fields end with '_timestamp'
- JSON serialized fields end with '_data'
- Count/metric fields end with '_up' or '_down' for metrics
- Foreign key references use the original table's column name

Common Columns
--------------

- `id` - Integer Primary Key
- `username` - String reference to Users table
- `entry_id` - String identifier for evaluated entries
- `timestamp` - DateTime of record creation
- `row_data` - JSON serialized data of the evaluated entry

Data Types
--------------

- `Integer` - For IDs and numeric values
- `String` - For short text fields (username, error_type)
- `Text` - For long text content (feedback, row_data)
- `DateTime` - For timestamps
- `Boolean` - For true/false flags