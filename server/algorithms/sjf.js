/**
 * Calculates scheduling metrics using the Shortest Job First (SJF) Non-Preemptive algorithm.
 *
 * @param {number[]} arrivalTimes - Array of arrival times for each process.
 * @param {number[]} burstTimes - Array of burst times for each process.
 * @returns {object|null} An object containing resultsTable and ganttChart arrays, or null if input is invalid.
 */
function calculateSjf(arrivalTimes, burstTimes) {
    // --- Input Validation ---
    if (!arrivalTimes || !burstTimes || arrivalTimes.length !== burstTimes.length || arrivalTimes.length === 0) {
      console.error("Invalid input for SJF calculation: Arrays invalid.");
      return null;
    }
    if (arrivalTimes.some(isNaN) || burstTimes.some(isNaN)) {
        console.error("Internal SJF Error: Non-numeric values found in arrays.");
        return null;
    }
    if (arrivalTimes.some(t => t < 0) || burstTimes.some(t => t <= 0)) {
        console.error("Internal SJF Error: Arrival times cannot be negative, and Burst times must be positive.");
        return null;
    }
    // --- End Validation ---
  
    const n = arrivalTimes.length;
    const processes = [];
    const completedProcessesData = []; // To store final calculated data
    const ganttChart = [];
  
    // 1. Create process objects with initial data and tracking status
    for (let i = 0; i < n; i++) {
      processes.push({
        id: `P${i + 1}`,
        arrivalTime: Number(arrivalTimes[i]),
        burstTime: Number(burstTimes[i]),
        originalIndex: i,
        isCompleted: false, // Track completion status
        startTime: 0,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
      });
    }
  
    let currentTime = 0;
    let completedCount = 0;
  
    // 2. Simulation Loop: Continue until all processes are completed
    while (completedCount < n) {
      // Find processes that have arrived and are not yet completed
      const readyCandidates = processes.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);
  
      // If no process is ready, advance time to the next arrival
      if (readyCandidates.length === 0) {
          // Find the earliest arrival time among the remaining incomplete processes
          let minNextArrival = Infinity;
          processes.forEach(p => {
              if (!p.isCompleted && p.arrivalTime < minNextArrival) {
                  minNextArrival = p.arrivalTime;
              }
          });
  
          // If minNextArrival is still Infinity, something is wrong (shouldn't happen if completedCount < n)
          if (minNextArrival === Infinity) {
               console.warn("SJF Warning: No ready candidates and no future arrivals found, but not all processes completed.");
               break; // Avoid infinite loop
          }
  
  
          // Add Idle time to Gantt chart if needed and update current time
          if (minNextArrival > currentTime) {
               ganttChart.push({ id: 'Idle', start: currentTime, end: minNextArrival });
               currentTime = minNextArrival;
          }
          continue; // Go back to the start of the loop to re-evaluate ready candidates
      }
  
      // Select the process with the shortest burst time from ready candidates
      // Tie-breaking: earliest arrival time, then original index
      readyCandidates.sort((a, b) => {
        if (a.burstTime !== b.burstTime) {
          return a.burstTime - b.burstTime; // Shortest burst time first
        }
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime; // Earliest arrival time first
        }
        return a.originalIndex - b.originalIndex; // Original order for final tie-break
      });
  
      const processToRun = readyCandidates[0]; // The chosen process
  
      // 3. Calculate metrics for the chosen process
      processToRun.startTime = currentTime; // SJF non-preemptive starts now
      processToRun.completionTime = currentTime + processToRun.burstTime;
      processToRun.turnaroundTime = processToRun.completionTime - processToRun.arrivalTime;
      processToRun.waitingTime = processToRun.turnaroundTime - processToRun.burstTime; // Or startTime - arrivalTime
  
      // 4. Add to Gantt chart
      ganttChart.push({
          id: processToRun.id,
          start: processToRun.startTime,
          end: processToRun.completionTime
      });
  
      // 5. Update state
      currentTime = processToRun.completionTime; // Advance current time
      processToRun.isCompleted = true;          // Mark process as completed
      completedProcessesData.push(processToRun); // Add to final list
      completedCount++;                         // Increment completed count
  
    } // End of while loop
  
    // 6. Sort the final results by original process order for the table
    completedProcessesData.sort((a, b) => a.originalIndex - b.originalIndex);
  
    // 7. Format the results table
    const resultsTable = completedProcessesData.map(p => ({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      startTime: p.startTime,
      completionTime: p.completionTime,
      turnaroundTime: p.turnaroundTime,
      waitingTime: p.waitingTime,
    }));
  
    // 8. Return results
    return {
      resultsTable: resultsTable,
      ganttChart: ganttChart,
    };
  }
  
  // Export the function
  module.exports = {
    calculateSjf,
  };