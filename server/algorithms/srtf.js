/**
 * Calculates scheduling metrics using the Shortest Remaining Time First (SRTF) Preemptive algorithm.
 *
 * @param {number[]} arrivalTimes - Array of arrival times for each process.
 * @param {number[]} burstTimes - Array of burst times for each process.
 * @returns {object|null} An object containing resultsTable and ganttChart arrays, or null if input is invalid.
 */
function calculateSrtf(arrivalTimes, burstTimes) {
    // --- Input Validation ---
    if (!arrivalTimes || !burstTimes || arrivalTimes.length !== burstTimes.length || arrivalTimes.length === 0) {
      console.error("Invalid input for SRTF calculation: Arrays invalid.");
      return null;
    }
    if (arrivalTimes.some(isNaN) || burstTimes.some(isNaN)) {
        console.error("Internal SRTF Error: Non-numeric values found in arrays.");
        return null;
    }
    if (arrivalTimes.some(t => t < 0) || burstTimes.some(t => t <= 0)) {
        console.error("Internal SRTF Error: Arrival times cannot be negative, and Burst times must be positive.");
        return null;
    }
    // --- End Validation ---
  
    const n = arrivalTimes.length;
    const processes = [];
    const completedProcessesData = []; // To store final calculated data
    const ganttChart = [];
  
    // 1. Create process objects with detailed tracking
    for (let i = 0; i < n; i++) {
      processes.push({
        id: `P${i + 1}`,
        arrivalTime: Number(arrivalTimes[i]),
        burstTime: Number(burstTimes[i]),        // Original burst time
        remainingBurstTime: Number(burstTimes[i]), // Time left to execute
        originalIndex: i,
        isCompleted: false,
        startTime: -1,         // First time execution starts
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        // lastActiveTime might be useful for complex wait time calc, but TAT - BT is easier here
      });
    }
  
    let currentTime = 0;
    let completedCount = 0;
    let lastGanttBlock = null; // For merging Gantt blocks
  
    // 2. Simulation Loop: Continue until all processes are completed
    while (completedCount < n) {
      // Find processes that have arrived and are not yet completed
      const readyCandidates = processes.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);
  
      // --- Handle Idle Time ---
      if (readyCandidates.length === 0) {
        // Find the earliest arrival time among remaining incomplete processes
        let minNextArrival = Infinity;
        processes.forEach(p => {
          if (!p.isCompleted && p.arrivalTime < minNextArrival) {
            minNextArrival = p.arrivalTime;
          }
        });
  
        // If no future arrivals and still processes left, something is wrong
        if (minNextArrival === Infinity) {
          console.warn("SRTF Warning: No ready candidates and no future arrivals, but not all processes completed.");
          break; // Avoid infinite loop
        }
  
        // Advance time only if the next arrival is in the future
        if (minNextArrival > currentTime) {
           const idleStart = currentTime;
           const idleEnd = minNextArrival;
           // Merge with last block if it was also idle
           if (lastGanttBlock && lastGanttBlock.id === 'Idle') {
               lastGanttBlock.end = idleEnd; // Extend the previous idle block
           } else {
               lastGanttBlock = { id: 'Idle', start: idleStart, end: idleEnd };
               ganttChart.push(lastGanttBlock);
           }
           currentTime = idleEnd;
        } else {
            // If next arrival is now or past (should theoretically just be now), set current time
            currentTime = minNextArrival;
        }
        continue; // Re-evaluate ready candidates at the new time
      }
      // --- End Handle Idle Time ---
  
  
      // 3. Select the process with the SHORTEST REMAINING burst time
      // Tie-breaking: earliest arrival time, then original index
      readyCandidates.sort((a, b) => {
        if (a.remainingBurstTime !== b.remainingBurstTime) {
          return a.remainingBurstTime - b.remainingBurstTime; // Shortest remaining time
        }
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime; // Earliest arrival
        }
        return a.originalIndex - b.originalIndex; // Original order
      });
  
      const processToRun = readyCandidates[0]; // Process with shortest remaining time
  
      // Record start time if this is the first time it runs
      if (processToRun.startTime === -1) {
        processToRun.startTime = currentTime;
      }
  
      // 4. Determine how long this process can run without interruption
      // Find the next event time: either this process finishes OR a new process arrives
      let timeToNextArrival = Infinity;
      processes.forEach(p => {
          if (!p.isCompleted && p.arrivalTime > currentTime && p.arrivalTime < timeToNextArrival) {
              timeToNextArrival = p.arrivalTime;
          }
      });
  
      const timeToCompletion = currentTime + processToRun.remainingBurstTime;
      const runUntil = Math.min(timeToNextArrival, timeToCompletion); // Run until completion or next arrival
      const runDuration = runUntil - currentTime;
  
      // Ensure we actually run for a positive duration
      if (runDuration <= 0) {
          // This might happen if an arrival is exactly at currentTime.
          // Simply advance time slightly or re-evaluate in the next iteration.
          // For simplicity here, we just continue, assuming the next loop finds the new arrival.
          // A more robust solution might advance time by a tiny epsilon or handle 0-duration events.
          // Let's just ensure currentTime minimum advances by 1 if needed to avoid potential stalls
          // IF no other event forces time forward. This simple advance isn't perfect physics
          // but helps prevent some infinite loops in edge cases.
          if (timeToNextArrival === currentTime && timeToCompletion === currentTime) {
               // Extremely rare case? Both finish and arrival at same instant.
               // Force completion check below without advancing time yet.
               // Or advance time minimally if stuck:
               // currentTime = currentTime + 1; // Avoid getting stuck, less accurate
               // Let's prioritize checking completion directly if remaining time is 0
               if(processToRun.remainingBurstTime <= 0) {
                   // Proceed to completion check below
               } else {
                   // Likely just an arrival, let next loop handle it
                   currentTime = Math.max(currentTime, processToRun.arrivalTime); // Ensure time doesn't go backward
                   continue;
               }
          } else {
               currentTime = runUntil; // Advance time if runDuration was 0 due to arrival
               continue; // Let next loop iteration handle the arrival/new state
          }
  
      }
  
      // 5. Update Gantt Chart (Merge if possible)
      const ganttStart = currentTime;
      const ganttEnd = runUntil;
      if (lastGanttBlock && lastGanttBlock.id === processToRun.id && lastGanttBlock.end === ganttStart) {
          // Extend the previous block for the same process
          lastGanttBlock.end = ganttEnd;
      } else {
          // Create a new block
          lastGanttBlock = { id: processToRun.id, start: ganttStart, end: ganttEnd };
          ganttChart.push(lastGanttBlock);
      }
  
  
      // 6. Update Process State
      processToRun.remainingBurstTime -= runDuration;
      currentTime = runUntil; // Advance current time
  
      // 7. Check for Completion
      if (processToRun.remainingBurstTime <= 0) {
        processToRun.isCompleted = true;
        processToRun.completionTime = currentTime;
        processToRun.turnaroundTime = processToRun.completionTime - processToRun.arrivalTime;
        processToRun.waitingTime = processToRun.turnaroundTime - processToRun.burstTime; // Use original burst time
        completedProcessesData.push(processToRun); // Add to final list
        completedCount++;
        lastGanttBlock = null; // Reset last block after completion to prevent incorrect merging
      }
  
      // Loop continues: Re-evaluates ready queue and selects shortest remaining time
  
    } // End of while loop
  
    // 8. Sort final results by original process order
    completedProcessesData.sort((a, b) => a.originalIndex - b.originalIndex);
  
    // 9. Format the results table
    const resultsTable = completedProcessesData.map(p => ({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime, // Original burst time for table
      startTime: p.startTime,
      completionTime: p.completionTime,
      turnaroundTime: p.turnaroundTime,
      waitingTime: p.waitingTime,
    }));
  
    // 10. Return results
    return {
      resultsTable: resultsTable,
      ganttChart: ganttChart,
    };
  }
  
  // Export the function
  module.exports = {
    calculateSrtf,
  };