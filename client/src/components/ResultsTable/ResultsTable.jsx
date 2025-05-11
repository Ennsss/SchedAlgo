// src/components/ResultsTable/ResultsTable.jsx

import React from 'react';
import './ResultsTable.css'; // Import component-specific CSS

function ResultsTable({ data }) {
  // Don't render if no data is provided or data is not an array

  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Check if the first process object in the data has a 'priority' key.
  // This determines if we should show the Priority column.
  const hasPriorityData = Object.prototype.hasOwnProperty.call(data[0], 'priority');

  // Calculate Averages (Optional but good for summary)
  // Use toFixed(2) to format to 2 decimal places
  const avgTurnaroundTime = (data.reduce((sum, p) => sum + p.turnaroundTime, 0) / data.length).toFixed(2);
  const avgWaitingTime = (data.reduce((sum, p) => sum + p.waitingTime, 0) / data.length).toFixed(2);

  return (
    <div className="results-table-container">
      <h4>Results Table</h4>
      <table className="results-table">
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            {/* Conditionally render the Priority header */}
            {hasPriorityData && <th>Priority</th>}
            <th>Start Time</th>
            <th>Completion Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((process) => (
            <tr key={process.id}>
              <td>{process.id}</td>
              <td>{process.arrivalTime}</td>
              <td>{process.burstTime}</td>
              {/* Conditionally render the Priority data cell */}
              {hasPriorityData && <td>{process.priority !== undefined ? process.priority : 'N/A'}</td>}
              <td>{process.startTime}</td>
              <td>{process.completionTime}</td>
              <td>{process.turnaroundTime}</td>
              <td>{process.waitingTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Optional: Display Averages */}
      <div className="averages">
        <p>Average Turnaround Time: {avgTurnaroundTime}</p>
        <p>Average Waiting Time: {avgWaitingTime}</p>
      </div>
    </div>
  );
}

export default ResultsTable;