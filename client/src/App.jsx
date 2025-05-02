// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import App specific CSS

// Import ACTUAL Components
import InputForm from './components/InputForm/InputForm';
import ResultsTable from './components/ResultsTable/ResultsTable';
import GanttChart from './components/GanttChart/GanttChart';

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
      // Trim whitespace from ends, split by one or more spaces, convert each part to Number
      const parsedArrivals = arrivalsString.trim().split(/\s+/).map(Number);
      const parsedBursts = burstsString.trim().split(/\s+/).map(Number);

      // Basic Client-Side Validation (Backend validation is still primary)
      if (parsedArrivals.some(isNaN) || parsedBursts.some(isNaN)) {
        throw new Error("Input Error: Arrival and Burst times must contain only numbers separated by spaces.");
      }
      if (parsedArrivals.length === 0 || parsedArrivals.length !== parsedBursts.length) {
        // Also handle case where input might be just whitespace resulting in empty arrays after trimming
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
      // Use environment variables for API URL in real projects
      // For development, hardcoding is okay for now:
      const apiUrl = 'http://localhost:5000/api/schedule'; // Ensure this matches your running backend port
      // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/schedule'; // If using Vite env variables
      console.log(`Sending POST request to ${apiUrl} with payload:`, payload);

      const response = await axios.post(apiUrl, payload);

      console.log('API Response:', response.data);

      // 5. Update state with results from the backend
      // Check if the expected data structure is present in the response
      if (response.data && response.data.resultsTable && response.data.ganttChart) {
        setResultsTable(response.data.resultsTable);
        setGanttChart(response.data.ganttChart);
      } else {
         // Handle unexpected response format from backend
         console.error("Unexpected response format:", response.data)
         throw new Error("Received invalid or incomplete data format from the server.");
      }

    } catch (err) {
      // 6. Handle errors (parsing errors or API call errors)
      console.error("Calculation or API Error:", err);
      let errorMessage = "An unexpected error occurred. Please check the console."; // Default message

      if (err.response) {
        // Error response from the backend API (e.g., 4xx, 5xx)
        errorMessage = `Server Error ${err.response.status}: ${err.response.data?.message || 'An error occurred on the server.'}`;
        // Attempt to extract more specific errors if backend provides them (like from express-validator)
        if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
            errorMessage = `Validation Error: ${err.response.data.errors.map(e => e.msg).join('. ')}`;
        }
      } else if (err.request) {
        // Request was made but no response received (network error, server down)
        errorMessage = "Network Error: Could not reach the server. Please ensure it's running and accessible.";
      } else if (err instanceof Error) {
        // Error during setup, parsing, or other client-side issue before request was sent
        errorMessage = err.message; // Use the message from the thrown error (e.g., validation messages)
      }

      setError(errorMessage); // Update the error state to display the message
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
        {/* Apply styling class directly or via CSS file */}
        <div className="input-section card">
          <h2>Input</h2>
          {/* Pass the handleCalculate function as the onSubmitProps prop */}
          <InputForm onSubmitProps={handleCalculate} />
        </div>

        {/* --- Output Section --- */}
        {/* Apply styling class directly or via CSS file */}
        <div className="output-section card">
          <h2>Output</h2>

          {/* Display Loading state */}
          {isLoading && <p>Calculating...</p>}

          {/* Display Error state */}
          {error && <p className="error-message">Error: {error}</p>}

          {/* Display Results - only renders if not loading, no error, AND data exists */}
          {!isLoading && !error && resultsTable && ganttChart && (
            <>
              <GanttChart data={ganttChart} />
              <ResultsTable data={resultsTable} />
            </>
          )}

          {/* Default message - Shows only if NOT loading, NO error, and NO results yet */}
          {!isLoading && !error && !resultsTable && !ganttChart && (
             <p>Gantt chart and table will be shown here after calculation.</p>
          )}
        </div>
      </div>

      {/* Info Section - Place it according to your desired layout */}
      <div className="info-section">
          <p>Info about the algorithm you use and how to do it</p>
          {/* You can make this dynamic based on the selected algorithm later */}
      </div>

      {/* Optional Footer */}
      <footer className="app-footer">
          {/* Add GitHub/Feedback links here */}
          <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a> | <a href="#" target="_blank" rel="noopener noreferrer">Feedback</a>
      </footer>

    </div>
  );
}

export default App;