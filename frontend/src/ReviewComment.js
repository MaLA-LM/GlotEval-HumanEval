import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const ReviewComment = () => {
  const sampleTasks = [
    { taskId: 1, task: 'Translation', input: 'Hola, ¿cómo estás?', output: 'Hello, how are you?' },
    { taskId: 2, task: 'Translation', input: 'Je m\'appelle Pierre.', output: 'My name is Pierre.' },
    { taskId: 3, task: 'Summarization', input: 'The sun rises in the east and sets in the west.', output: 'The sun rises in the east.' },
    { taskId: 4, task: 'Summarization', input: 'This document describes the steps to build a treehouse.', output: 'How to build a treehouse.' },
  ];

  const translationQuestions = [
    'Are there specific phrases that seem mistranslated?',
    'Did the translation omit any important details?',
  ];

  const summarizationQuestions = [
    'Does the summary capture the main points?',
    'Is there redundant information?',
  ];

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [freeFormComment, setFreeFormComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(true);
  const [showImportExportSection, setShowImportExportSection] = useState(true);

  const handleSaveComment = () => {
    if (!selectedTask) {
      alert('Please select a task to comment on.');
      return;
    }

    if (!selectedQuestion && !freeFormComment.trim()) {
      alert('Please type a comment or select a question to provide feedback.');
      return;
    }

    const timestamp = new Date().toLocaleString();
    const newComment = {
      task: selectedTask.task,
      input: selectedTask.input,
      output: selectedTask.output,
      username: 'User1', // Placeholder username
      timestamp,
      comment: selectedQuestion
        ? `${selectedQuestion}${freeFormComment ? ` - ${freeFormComment}` : ''}`
        : freeFormComment,
    };

    setComments((prevComments) => [...prevComments, newComment]);

    setFreeFormComment('');
    setSelectedQuestion('');
    alert('Comment saved successfully!');
  };

  const handleDeleteComment = (index) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments((prevComments) => prevComments.filter((_, i) => i !== index));
    }
  };

  const handleExport = () => {
    const jsonBlob = new Blob([JSON.stringify(comments, null, 2)], { type: 'application/json' });
    saveAs(jsonBlob, 'comments.json');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedComments = JSON.parse(event.target.result);
        setComments(importedComments);
        alert('Comments imported successfully!');
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h2>Task Table</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>TaskID</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Task</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Input</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Output</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sampleTasks.map((task) => (
            <tr key={task.taskId}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{task.taskId}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{task.task}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{task.input}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{task.output}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <button onClick={() => setSelectedTask(task)}>Comment</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTask && (
        <>
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            style={{
              marginBottom: '10px',
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showFeedbackForm ? 'Hide Feedback Form' : 'Show Feedback Form'}
          </button>

          {showFeedbackForm && (
            <div>
              <h3>Provide Feedback for Task</h3>
              <div
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: '#f1f1f1',
                }}
              >
                <p><strong>Task:</strong> {selectedTask.task}</p>
                <p><strong>Input:</strong> {selectedTask.input}</p>
                <p><strong>Output:</strong> {selectedTask.output}</p>
              </div>

              {(selectedTask.task === 'Translation' ? translationQuestions : summarizationQuestions).map(
                (q, i) => (
                  <div key={i}>
                    <label>
                      <input
                        type="radio"
                        value={q}
                        checked={selectedQuestion === q}
                        onChange={() => setSelectedQuestion(q)}
                      />
                      {q}
                    </label>
                  </div>
                )
              )}
              <div>
                <label>
                  <input
                    type="radio"
                    value="Free Form Comment"
                    checked={selectedQuestion === 'Free Form Comment'}
                    onChange={() => setSelectedQuestion('Free Form Comment')}
                  />
                  Free Form Comment
                </label>
              </div>
              <textarea
                value={freeFormComment}
                onChange={(e) => setFreeFormComment(e.target.value)}
                placeholder="Enter free-form feedback here..."
                rows="5"
                cols="50"
                style={{ width: '100%', marginTop: '10px' }}
              />
              <br />
              <button onClick={handleSaveComment} style={{ marginTop: '10px' }}>
                Save Comment
              </button>
            </div>
          )}
        </>
      )}

      <h2>
        Feedback Section{' '}
        <button onClick={() => setShowComments(!showComments)}>
          {showComments ? 'Hide' : 'Show'}
        </button>
      </h2>
      {showComments && (
        <div>
          {comments.map((c, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <p><strong>Username:</strong> {c.username}</p>
              <p><strong>Timestamp:</strong> {c.timestamp}</p>
              <p><strong>Task:</strong> {c.task}</p>
              <p><strong>Input:</strong> {c.input}</p>
              <p><strong>Output:</strong> {c.output}</p>
              <p><strong>Comment:</strong> {c.comment}</p>
              <button onClick={() => handleDeleteComment(index)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      <h2>
        Import/Export Comments{' '}
        <button onClick={() => setShowImportExportSection(!showImportExportSection)}>
          {showImportExportSection ? 'Hide' : 'Show'}
        </button>
      </h2>
      {showImportExportSection && (
        <div>
          <button onClick={handleExport}>Export to JSON</button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'block', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewComment;
