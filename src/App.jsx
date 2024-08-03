import React from 'react'
import AirtableEveningRoutineChecker from './components/AirtableEveningRoutineChecker'

function App() {
  console.log("App component rendering");
  try {
    return (
      <div className="App">
        <h1>App Header</h1>
        <AirtableEveningRoutineChecker />
      </div>
    )
  } catch (error) {
    console.error("Error rendering App:", error);
    return <div>An error occurred</div>;
  }
}

export default App