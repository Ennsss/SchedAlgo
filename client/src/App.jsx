// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API calls


// Import Components (assuming you have these or will create them)
import InputForm from './components/InputForm/InputForm';
// Placeholders for output components - create these files later
// import ResultsTable from './components/ResultsTable/ResultsTable';
// import GanttChart from './components/GanttChart/GanttChart';

// Basic placeholder components (replace with actual implementations later)
function ResultsTable({ data }) {
  if (!data) return null;
  return (
    <div>
      <h4>Results Table</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* Simple display for now */}
    </div>
  );
}
function GanttChart({ data }) {
  if (!data) return null;
  return (
    <div>
      <h4>Gantt Chart</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* Simple display for now */}
    </div>
  );
}
// --- End Placeholder Components ---


function App() {
  // State for holding the results from the backend
  const [resultsTable, setResultsTable] = useState(null);
  const [ganttChart, setGanttChart] = useState(null);

  // State for loading indicator while API call is in progress
  const [isLoading, setIsLoading] = useState(false);

  // State for holding potential errors (from parsing, API, etc.)
  const [error, setError] = useState(null);

  // Handler function passed to InputForm, now performs calculations/API call
  const handleCalculate = async (algo, arrivalsString, burstsString) => {
    console.log('--- handleCalculate Triggered ---');
    console.log('Received:', { algo, arrivalsString, burstsString });

    // 1. Reset state for new calculation
    setIsLoading(true);
    setError(null);
    setResultsTable(null); // Clear previous results
    setGanttChart(null); // Clear previous results

    try {
      // 2. Parse and validate input strings
      const parsedArrivals = arrivalsString.trim().split(/\s+/).map(Number); // Split by spaces, convert to numbers
      const parsedBursts = burstsString.trim().split(/\s+/).map(Number); // Split by spaces, convert to numbers

      // Basic Client-Side Validation (Backend validation is still primary)
      if (parsedArrivals.some(isNaN) || parsedBursts.some(isNaN)) {
        throw new Error("Input Error: Arrival and Burst times must contain only numbers separated by spaces.");
      }
      if (parsedArrivals.length === 0 || parsedArrivals.length !== parsedBursts.length) {
        throw new Error("Input Error: Please provide valid Arrival and Burst times. Ensure arrays are non-empty and have the same length.");
      }
       if (parsedArrivals.some(t => t < 0) || parsedBursts.some(t => t <= 0) ) {
           // Basic check for negative arrival or non-positive burst times
           throw new Error("Input Error: Arrival times cannot be negative, and Burst times must be positive.");
       }


      console.log('Parsed Data:', { algo, parsedArrivals, parsedBursts });

      // 3. Prepare data payload for API
      const payload = {
        algorithm: algo,
        arrivalTimes: parsedArrivals,
        burstTimes: parsedBursts,
        // Add timeQuantum here if implementing RR later
        // timeQuantum: algo === 'RR' ? timeQuantumValue : undefined
      };

      // 4. Make the API call using axios
      //    Replace VITE_API_URL with your actual backend URL if using env variables,
      //    otherwise hardcode (less ideal for production)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/schedule';
      console.log(`Sending POST request to ${apiUrl} with payload:`, payload);

      const response = await axios.post(apiUrl, payload);

      console.log('API Response:', response.data);

      // 5. Update state with results from the backend
      if (response.data && response.data.resultsTable && response.data.ganttChart) {
        setResultsTable(response.data.resultsTable);
        setGanttChart(response.data.ganttChart);
      } else {
         // Handle unexpected response format from backend
         throw new Error("Received invalid data format from server.");
      }

    } catch (err) {
      // 6. Handle errors (parsing errors or API call errors)
      console.error("Calculation or API Error:", err);
      let errorMessage = "An unexpected error occurred.";
      if (err.response) {
        // Error came from the backend API (e.g., 400 Bad Request)
        errorMessage = `Server Error ${err.response.status}: ${err.response.data.message || 'Bad Request'}`;
        // If using express-validator, errors might be in err.response.data.errors
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            errorMessage = err.response.data.errors.map(e => e.msg).join(' ');
        }
      } else if (err.request) {
        // Request was made but no response received (network error, server down)
        errorMessage = "Network Error: Could not reach the server. Is it running?";
      } else if (err instanceof Error) {
        // Error during setup, parsing, or other client-side issue
        errorMessage = err.message;
      }
      setError(errorMessage);
      setResultsTable(null); // Clear results on error
      setGanttChart(null); // Clear results on error
    } finally {
      // 7. Ensure loading state is turned off regardless of success/failure
      setIsLoading(false);
      console.log('--- handleCalculate Finished ---');
    }
  };


  // --- Render the UI ---
  return (
    <div className="app-container">
      <h1>CPU Scheduling Visualizer</h1>
      <div className="main-content">
        {/* --- Input Section --- */}
        <div className="input-section card"> {/* Added 'card' class for styling */}
          <h2>Input</h2>
          {/* Pass the handleCalculate function as the onSubmitProps prop */}
          <InputForm onSubmitProps={handleCalculate} />
        </div>

        {/* --- Output Section --- */}
        <div className="output-section card"> {/* Added 'card' class for styling */}
          <h2>Output</h2>
          {/* Display Loading state */}
          {isLoading && <p>Calculating...</p>}

          {/* Display Error state */}
          {error && <p className="error-message">Error: {error}</p>}

          {/* Display Results only if not loading and no error */}
          {!isLoading && !error && resultsTable && ganttChart && (
            <>
              <GanttChart data={ganttChart} />
              <ResultsTable data={resultsTable} />
            </>
          )}

          {/* Default message if no results, not loading, and no error */}
          {!isLoading && !error && !resultsTable && (
            <p>Gantt chart and table will be shown here after calculation.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;