import React from 'react';
import ReviewComment from './ReviewComment';

function App() {
  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Human Evaluation Interface</h1>
      <ReviewComment />
    </div>
  );
}

export default App;
