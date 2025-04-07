import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Add a debug message to the DOM directly
    const debugDiv = document.createElement('div');
    debugDiv.innerText = 'Debug: App.tsx is running';
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '0';
    debugDiv.style.left = '0';
    debugDiv.style.background = 'red';
    debugDiv.style.color = 'white';
    document.body.appendChild(debugDiv);
  }, []);

  return (
    <div>
      <h1>Hello, TeenVerse!</h1>
      <p>This is a test to ensure the app renders.</p>
    </div>
  );
}

export default App;
