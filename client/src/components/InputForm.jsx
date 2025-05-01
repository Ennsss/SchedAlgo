import React, { useState } from 'react';
import './InputForm.css'; // Assuming you have some CSS

// Accept onSubmitProps (or rename prop to onSubmit if you prefer)
function InputForm({ onSubmitProps }) {
  const [algorithm, setAlgorithm] = useState('FCFS'); // Default value
  const [arrivalTimes, setArrivalTimes] = useState('');
  const [burstTimes, setBurstTimes] = useState('');

  // --- Handle form submission ---
  const handleSubmit = (event) => {
    event.preventDefault(); 
    if (onSubmitProps) {
        onSubmitProps(algorithm, arrivalTimes, burstTimes);
    } else {
        console.warn("onSubmitProps function was not provided to InputForm");
    }
  };

  // --- Return the JSX for the form ---
  // This is the part that was missing or incomplete in your snippet
  return (
    // Attach the handleSubmit function to the form's onSubmit event
    <form className="input-form" onSubmit={handleSubmit}>

      {/* Algorithm Selection */}
      <div className="form-group">
        <label htmlFor="algorithm-select">Algorithm</label>
        <select
          id="algorithm-select"
          value={algorithm} // USE state variable 'algorithm'
          // USE setter 'setAlgorithm'
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="FCFS">First Come First Serve, FCFS</option>
          {/* Add more options later */}
        </select>
      </div>

      {/* Arrival Times Input */}
      <div className="form-group">
        <label htmlFor="arrival-times">Arrival Times</label>
        <input
          type="text"
          id="arrival-times"
          value={arrivalTimes} // USE state variable 'arrivalTimes'
          // USE setter 'setArrivalTimes'
          onChange={(e) => setArrivalTimes(e.target.value)}
          placeholder="e.g. 0 2 4 6 8"
        />
      </div>

      {/* Burst Times Input */}
      <div className="form-group">
        <label htmlFor="burst-times">Burst Times</label>
        <input
          type="text"
          id="burst-times"
          value={burstTimes} // USE state variable 'burstTimes'
          // USE setter 'setBurstTimes'
          onChange={(e) => setBurstTimes(e.target.value)}
          placeholder="e.g. 2 4 6 8 10"
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