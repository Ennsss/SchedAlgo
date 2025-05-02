/**
 * Calculates scheduling metrics using the Round Robin (RR) algorithm.
 *
 * @param {number[]} arrivalTimes - Array of arrival times for each process.
 * @param {number[]} burstTimes - Array of burst times for each process.
 * @param {number} timeQuantum - The time quantum for Round Robin.
 * @returns {object|null} An object containing resultsTable and ganttChart arrays, or null if input is invalid.
 */
function calculateRr(arrivalTimes, burstTimes, timeQuantum) {
    // Basic input validation
    if (!arrivalTimes || !burstTimes || arrivalTimes.length !== burstTimes.length || arrivalTimes.length === 0) {
      console.error("Invalid input for RR calculation: Arrays invalid.");
      return null;
    }
    if (typeof timeQuantum !== 'number' || timeQuantum <= 0 || !Number.isInteger(timeQuantum)) {
        console.error("Invalid input for RR calculation: Time quantum must be a positive integer.");
        return null;
    }
    if (arrivalTimes.some(isNaN) || burstTimes.some(isNaN)) {
        console.error("Internal RR Error: Non-numeric values found in arrays.");
        return null;
    }
      // Further check: ensure burst times are positive, arrival times non-negative
      if (arrivalTimes.some(t => t < 0) || burstTimes.some(t => t <= 0)) {
          console.error("Internal RR Error: Arrival times cannot be negative, and Burst times must be positive.");
          return null;
      }
  
  
    const n = arrivalTimes.length;
    const processes = [];
    let processMap = {}; // To easily access process details by ID
  
    // 1. Create enriched process objects
    for (let i = 0; i < n; i++) {
      const process = {
        id: `P${i + 1}`,
        arrivalTime: Number(arrivalTimes[i]),
        burstTime: Number(burstTimes[i]),        // Original burst time
        remainingBurstTime: Number(burstTimes[i]), // Time left to execute
        originalIndex: i,
        startTime: -1,      // Initialize start time (first execution)
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        lastExecutionTime: Number(arrivalTimes[i]) // Track when it last entered/left ready queue
      };
      processes.push(process);
      processMap[process.id] = process; // Store reference in map
    }
  
    // Sort processes initially by arrival time for efficient checking
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
    let currentTime = 0;
    const readyQueue = []; // Queue of process IDs ready to run
    const ganttChart = [];
    const completedProcesses = []; // Store final data for table
    let completedCount = 0;
    let processIndex = 0; // To track next process to check for arrival
  
    // 2. Simulation Loop: Continue until all processes are completed
    while (completedCount < n) {
  
      // Add newly arrived processes to the ready queue
      while (processIndex < n && processes[processIndex].arrivalTime <= currentTime) {
        readyQueue.push(processes[processIndex].id);
        processIndex++;
      }
  
      // If ready queue is empty, advance time to the next arrival or idle
      if (readyQueue.length === 0) {
        // If no processes left to arrive and queue is empty, break (shouldn't happen if completedCount < n)
         if (processIndex >= n) {
             // This condition might indicate an issue if completedCount < n, log it
             console.warn("RR Warning: Ready queue empty, no more arrivals, but not all processes completed.");
             break;
         }
  
        // If CPU is idle, record idle time and advance currentTime
        const nextArrivalTime = processes[processIndex].arrivalTime;
        if (nextArrivalTime > currentTime) {
            ganttChart.push({ id: 'Idle', start: currentTime, end: nextArrivalTime });
            currentTime = nextArrivalTime;
             // Re-check for arrivals at the new currentTime
             while (processIndex < n && processes[processIndex].arrivalTime <= currentTime) {
                  readyQueue.push(processes[processIndex].id);
                  processIndex++;
              }
        }

        continue; // Skip to next iteration to process the queue
      }
  
  
      // Get the next process from the ready queue
      const currentProcessId = readyQueue.shift(); // Get from front
      const currentProcess = processMap[currentProcessId];
  
      // Record start time if it's the first time this process runs
      if (currentProcess.startTime === -1) {
          currentProcess.startTime = currentTime;
          // Calculate initial wait time segment (Wait = Start - Arrival) only once
          currentProcess.waitingTime += currentTime - currentProcess.arrivalTime;
      } else {
           // Calculate intermittent wait time (Time since last run - Arrival/Last finish)
           currentProcess.waitingTime += currentTime - currentProcess.lastExecutionTime;
      }
  
  
      // Determine run duration: min(quantum, remaining time)
      const runDuration = Math.min(timeQuantum, currentProcess.remainingBurstTime);
  
      // Add execution block to Gantt chart
      ganttChart.push({ id: currentProcess.id, start: currentTime, end: currentTime + runDuration });
  
      // Update process state
      currentProcess.remainingBurstTime -= runDuration;
      const executionEndTime = currentTime + runDuration; // Store when this slice ends
  
      // Update current time *before* checking for new arrivals during this slice
      currentTime = executionEndTime;
  
  
      // Add any processes that arrived *during* this execution slice
      while (processIndex < n && processes[processIndex].arrivalTime <= currentTime) {
          readyQueue.push(processes[processIndex].id);
          processIndex++;
      }
  
      // Check if process completed
      if (currentProcess.remainingBurstTime <= 0) {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        // Final waiting time is Turnaround - Original Burst Time
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        completedProcesses.push(currentProcess);
        completedCount++;
      } else {
        // Process not finished, add it back to the *end* of the ready queue
        currentProcess.lastExecutionTime = currentTime; // Update last execution time
        readyQueue.push(currentProcess.id);
      }
    } // End of while loop
  
    // 3. Sort the results table back to the original process order
    completedProcesses.sort((a, b) => a.originalIndex - b.originalIndex);
  
    // 4. Format the results table data
    const resultsTable = completedProcesses.map(p => ({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      startTime: p.startTime, // First time it started execution
      completionTime: p.completionTime,
      turnaroundTime: p.turnaroundTime,
      waitingTime: p.waitingTime,
    }));
  
    return {
      resultsTable: resultsTable,
      ganttChart: ganttChart,
    };
  }
  
  // Export the function
  module.exports = {
    calculateRr,
  };