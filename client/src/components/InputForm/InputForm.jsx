import React, { useState } from 'react';
import './InputForm.css';

// Accept onSubmitProps prop from App.jsx
function InputForm({ onSubmitProps }) {
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [arrivalTimes, setArrivalTimes] = useState('');
  const [burstTimes, setBurstTimes] = useState('');
  // ---> 1. Add state for Time Quantum <---
  const [timeQuantum, setTimeQuantum] = useState(''); 
  const [priorities, setPriorities] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();

    console.log('Form Submitted:');
    console.log('Algorithm:', algorithm);
    console.log('Arrival Times:', arrivalTimes);
    console.log('Burst Times:', burstTimes);
    // Log time quantum only if relevant
    if (algorithm === 'RR') {
      console.log('Time Quantum:', timeQuantum);
    }

    // Call the function passed via props
    if (onSubmitProps) {
      const isPriorityAlgo = algorithm === 'PRIORITY-NP' || algorithm === 'PRIORITY-P';
      onSubmitProps(algorithm, arrivalTimes, burstTimes, timeQuantum, isPriorityAlgo ? priorities : undefined);
    } else {
      console.warn("onSubmitProps function was not provided to InputForm");
    }
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      {/* Algorithm Selection */}
      <div className="form-group">
        <label htmlFor="algorithm-select">Algorithm</label>
        <select
          id="algorithm-select"
          value={algorithm}
          onChange={(e) => {
            setAlgorithm(e.target.value);
            // Optional: Clear time quantum if switching away from RR
            if (e.target.value !== 'RR') {
                setTimeQuantum('');
            }
          }}
        >
          <option value="FCFS">First Come First Serve</option>
          <option value="SJF">Shortest Job First</option>
          <option value="RR">Round Robin</option>
          <option value="SRTF">Shortest Remaining Time First</option>
          <option value="PRIORITY-NP">Priority (Non-Preemptive)</option>
          <option value="PRIORITY-P">Priority (Preemptive)</option>
        </select>
      </div>

      {/* Arrival Times Input */}
      <div className="form-group">
        <label htmlFor="arrival-times">Arrival Times</label>
        <input
          type="text"
          id="arrival-times"
          value={arrivalTimes}
          onChange={(e) => setArrivalTimes(e.target.value)}
          placeholder="e.g. 0 2 4 6 8"
          aria-label="Enter arrival times separated by spaces"
          required // Add basic browser validation
        />
      </div>

      {/* Burst Times Input */}
      <div className="form-group">
        <label htmlFor="burst-times">Burst Times</label>
        <input
          type="text"
          id="burst-times"
          value={burstTimes}
          onChange={(e) => setBurstTimes(e.target.value)}
          placeholder="e.g. 2 4 6 8 10"
          aria-label="Enter burst times separated by spaces"
          required // Add basic browser validation
        />
      </div>

      {/* --- 2. Conditionally Render Time Quantum Input --- */}
      {algorithm === 'RR' && ( // Render this block only if algorithm is 'RR'
        <div className="form-group">
          <label htmlFor="time-quantum">Time Quantum</label>
          <input
            type="number" // Use number type for better input control
            id="time-quantum"
            value={timeQuantum}
            onChange={(e) => setTimeQuantum(e.target.value)}
            placeholder="e.g. 2"
            aria-label="Enter time quantum for Round Robin"
            min="1" // Time quantum should be positive
            required // Make it required when visible
          />
        </div>
      )}
      {(algorithm === 'PRIORITY-NP' || algorithm === 'PRIORITY-P') && (
        <div className="form-group">
          <label htmlFor="priorities">Priorities (Lower # = Higher Priority)</label>
          <input
            type="text"
            id="priorities"
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            placeholder="e.g. 1 3 2 4"
            aria-label="Enter priorities separated by spaces"
            required // Make it required when visible
          />
        </div>
      )}
      <button type="submit" className="solve-button">
        Solve
      </button>

    </form>
  );
}

export default InputForm;