
import React, { useState } from 'react'; 
import './Inputform.css'; // Import CSS for styling
function InputForm() {
   // State variable for the selected algorithm, default to 'FCFS'
   const [algorithm, setAlgorithm] = useState('FCFS');
   // State variable for the text in the Arrival Times input
   const [arrivalTimes, setArrivalTimes] = useState('');
   // State variable for the text in the Burst Times input
   const [burstTimes, setBurstTimes] = useState('');
   const handleSubmit = (event) => {
    
    event.preventDefault(); // VERY IMPORTANT: Prevent page reload on submit

    // --- TODO LATER: Data Parsing and Validation ---
    // 1. Parse arrivalTimes and burstTimes strings into arrays of numbers.
    // 2. Perform basic client-side validation (e.g., are they numbers? same length? non-negative?).
    // 3. If valid, proceed. If not, show an error message to the user.
    // -----------------------------------------------

    // For now, just log the raw data to the console to check
    console.log('Form Submitted:');
    console.log('Algorithm:', algorithm);
    console.log('Arrival Times:', arrivalTimes);
    console.log('Burst Times:', burstTimes);

    // --- TODO LATER: Call the actual submission handler from props ---
    // This function will eventually call a function passed down from App.jsx
    // Example: onSubmitProps(algorithm, parsedArrivalTimes, parsedBurstTimes);
    // --------------------------------------------------------------
  };
  return (
    
    <form className="input-form" onSubmit={handleSubmit}> 
    {/* Algorithm Selection */}
    <div className="form-group">
      <label htmlFor="algorithm-select">Algorithm</label>
      <select
        id="algorithm-select"
        value={algorithm} 
        onChange={(e) => setAlgorithm(e.target.value)} 
      >
        <option value="FCFS">First Come First Serve</option>
        <option value="SJF">Shortest Job First</option>
        <option value="RR">Round Robin</option>
        <option value="SRTF">Shortest Remaining Time First</option>
        {/* Add more algorithms as needed */}
      </select>
    </div>

    {/* Arrival Times Input */}
    <div className="form-group">
      <label htmlFor="arrival-times">Arrival Times</label>
      <input
        type="text"
        id="arrival-times"
        value={arrivalTimes} // Controlled component: value linked to state
        onChange={(e) => setArrivalTimes(e.target.value)} // Update state on change
        placeholder="e.g. 0 2 4 6 8"
        aria-label="Enter arrival times separated by spaces" 
      />
    </div>

    {/* Burst Times Input */}
    <div className="form-group">
      <label htmlFor="burst-times">Burst Times</label>
      <input
        type="text"
        id="burst-times"
        value={burstTimes} // Controlled component: value linked to state
        onChange={(e) => setBurstTimes(e.target.value)} // Update state on change
        placeholder="e.g. 2 4 6 8 10"
        aria-label="Enter burst times separated by spaces" // Accessibility
      />
    </div>
    

    {/* Submit Button */}
    <button type="submit" className="solve-button">
      Solve
    </button>
    
  </form>
  );
}



export default InputForm;