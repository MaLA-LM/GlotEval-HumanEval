import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';

const ReviewComment = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [sampleTasks, setSampleTasks] = useState([
    { taskId: 1, task: 'Translation', input: 'Hola, ¿cómo estás?', output: 'Hello, how are you?' },
    { taskId: 2, task: 'Translation', input: 'Je m\'appelle Pierre.', output: 'My name is Pierre.' },
    { taskId: 3, task: 'Summarization', input: 'The sun rises in the east and sets in the west. It provides light and warmth to Earth throughout the day.', output: 'The sun rises in the east and sets in the west, providing light and warmth.' },
    { taskId: 4, task: 'Summarization', input: 'This comprehensive document describes the detailed steps required to construct a treehouse, including material selection, safety considerations, and construction techniques.', output: 'A guide on building a treehouse covering materials, safety, and construction.' },
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [freeFormComment, setFreeFormComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const predefinedQuestions = {
    Translation: [
      'Are there specific phrases that seem mistranslated?',
      'Did the translation omit any important details?',
      'Is the translation culturally appropriate?',
      'Does the translation maintain the original tone?'
    ],
    Summarization: [
      'Does the summary capture the main points?',
      'Is there redundant information?',
      'Is the summary coherent and well-structured?',
      'Are any crucial details missing?'
    ]
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/comments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      setError('Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleSaveComment = async () => {
    if (!selectedTask) {
      setError('Please select a task to comment on.');
      return;
    }

    if (!selectedQuestion && !freeFormComment && !customTag) {
      setError('Please provide some feedback.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          taskId: selectedTask.taskId,
          taskType: selectedTask.task,
          input: selectedTask.input,
          output: selectedTask.output,
          comment: customTag
            ? `[${customTag}] ${freeFormComment}`
            : selectedQuestion
            ? `[${selectedQuestion}] ${freeFormComment}`
            : freeFormComment
        }),
      });

      if (response.ok) {
        await fetchComments();
        setFreeFormComment('');
        setSelectedQuestion('');
        setCustomTag('');
        setError(null);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      setError('Failed to save comment');
    }
  };

  const handleExport = () => {
    const jsonBlob = new Blob([JSON.stringify(comments, null, 2)], { type: 'application/json' });
    saveAs(jsonBlob, `comments-${new Date().toISOString()}.json`);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedComments = JSON.parse(event.target.result);
        setComments(importedComments);
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review Dashboard</h1>
        <div className="flex gap-4">
          <span className="text-gray-600">
            Welcome, {localStorage.getItem('username')}!
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task ID
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Input
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleTasks.map((task) => (
                <tr key={task.taskId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.taskId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.task}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.input}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.output}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Review Task {selectedTask.taskId}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-2">Input</h3>
              <p className="text-gray-600">{selectedTask.input}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Output</h3>
              <p className="text-gray-600">{selectedTask.output}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Predefined Questions</h3>
              <div className="space-y-2">
                {predefinedQuestions[selectedTask.task].map((q, i) => (
                  <label key={i} className="flex items-center">
                    <input
                      type="radio"
                      name="question"
                      value={q}
                      checked={selectedQuestion === q}
                      onChange={(e) => {
                        setSelectedQuestion(e.target.value);
                        setCustomTag('');
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{q}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Custom Tag</h3>
              <input
                type="text"
                value={customTag}
                onChange={(e) => {
                  setCustomTag(e.target.value);
                  setSelectedQuestion('');
                }}
                placeholder="Enter custom tag..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Comment</h3>
              <textarea
                value={freeFormComment}
                onChange={(e) => setFreeFormComment(e.target.value)}
                placeholder="Enter your feedback here..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleSaveComment}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Comment
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Previous Comments</h2>
          <div className="space-x-4">
            <button
              onClick={handleExport}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Export Comments
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer"
            >
              Import Comments
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="font-medium">Task ID:</span> {comment.taskId}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {comment.taskType}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Input:</span> {comment.input}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Output:</span> {comment.output}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Comment:</span> {comment.comment}
                </div>
                <div className="text-sm text-gray-500">
                  By {comment.username} on{' '}
                  {new Date(comment.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewComment;