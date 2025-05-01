// src/App.jsx
import React, { _useState } from 'react'; // Keep useState if needed here later
import './InputForm.css'; // Or your main CSS
import InputForm from './components/InputForm/InputForm'; // Adjust path if needed
function App() {
  // State for results will go here later
  // const [results, setResults] = useState(null);

  // Handler function to be passed to InputForm (will make API call later)
  const handleCalculate = (algo, arrivals, bursts) => {
    console.log('--- Data Received in App.jsx ---');
    console.log('Algorithm:', algo);
    console.log('Arrival Times String:', arrivals);
    console.log('Burst Times String:', bursts);
    // TODO LATER:
    // 1. Parse arrival/burst time strings into arrays of numbers here.
    // 2. Perform validation if not done in InputForm.
    // 3. Make the actual API call using axios/fetch to your backend.
    // 4. Update state with the results received from the backend.
  };


  return (
    <div className="app-container"> {/* Example container */}
      <h1>CPU Scheduling Visualizer</h1>
      <div className="main-content"> {/* Example layout */}
        <div className="input-section">
          <h2>Input</h2>
          {/* Pass the handleCalculate function as a prop */}
          <InputForm onSubmitProps={handleCalculate} />
        </div>
        <div className="output-section">
          <h2>Output</h2>
          {/* Output (Gantt chart, table) will go here later */}
          <p>Gantt chart and table will be shown here</p>
        </div>
      </div>
    </div>
  );
}

export default App;