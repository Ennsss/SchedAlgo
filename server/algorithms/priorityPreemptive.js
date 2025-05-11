/**
 * Calculates scheduling metrics using Priority Preemptive algorithm.
 * Assumes lower number means higher priority.
 *
 * @param {number[]} arrivalTimes
 * @param {number[]} burstTimes
 * @param {number[]} priorities
 * @returns {object|null}
 */
function calculatePriorityPreemptive(arrivalTimes, burstTimes, priorities) {
    // --- Input Validation ---
    if (!arrivalTimes || !burstTimes || !priorities ||
        arrivalTimes.length !== burstTimes.length ||
        arrivalTimes.length !== priorities.length ||
        arrivalTimes.length === 0) {
      console.error("Invalid input for Priority Preemptive: Arrays invalid or mismatched lengths.");
      return null;
    }
     if (arrivalTimes.some(isNaN) || burstTimes.some(isNaN) || priorities.some(isNaN)) {
         console.error("Internal Priority P Error: Non-numeric values found in arrays.");
         return null;
     }
     if (arrivalTimes.some(t => t < 0) || burstTimes.some(t => t <= 0) || priorities.some(p => typeof p !== 'number')) {
         console.error("Internal Priority P Error: Invalid values in arrays.");
         return null;
     }
    // --- End Validation ---
  
    const n = arrivalTimes.length;
    const processes = [];
    const completedProcessesData = [];
    const ganttChart = [];
  
    for (let i = 0; i < n; i++) {
      processes.push({
        id: `P${i + 1}`,
        arrivalTime: Number(arrivalTimes[i]),
        burstTime: Number(burstTimes[i]),
        priority: Number(priorities[i]),
        remainingBurstTime: Number(burstTimes[i]),
        originalIndex: i,
        isCompleted: false,
        startTime: -1,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
      });
    }
  
    let currentTime = 0;
    let completedCount = 0;
    let lastGanttBlock = null;
  
    while (completedCount < n) {
      const readyCandidates = processes.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);
  
      if (readyCandidates.length === 0) {
        let minNextArrival = Infinity;
        processes.forEach(p => {
          if (!p.isCompleted && p.arrivalTime < minNextArrival) {
            minNextArrival = p.arrivalTime;
          }
        });
        if (minNextArrival === Infinity) { break; }
  
        if (minNextArrival > currentTime) {
           const idleStart = currentTime;
           const idleEnd = minNextArrival;
           if (lastGanttBlock && lastGanttBlock.id === 'Idle') {
               lastGanttBlock.end = idleEnd;
           } else {
               lastGanttBlock = { id: 'Idle', start: idleStart, end: idleEnd };
               ganttChart.push(lastGanttBlock);
           }
           currentTime = idleEnd;
        } else {
            currentTime = minNextArrival;
        }
        continue;
      }
  
      // Select by HIGHEST priority (lowest number), then arrival, then index
      readyCandidates.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority; // Lower number = higher priority
        }
        if (a.arrivalTime !== b.arrivalTime) {
          return a.arrivalTime - b.arrivalTime;
        }
        return a.originalIndex - b.originalIndex;
      });
  
      const processToRun = readyCandidates[0];
  
      if (processToRun.startTime === -1) {
        processToRun.startTime = currentTime;
      }
  
      // Determine how long this process can run without preemption by higher priority or arrival
      let timeToNextEvent = Infinity;
      processes.forEach(p => {
          if (!p.isCompleted && p.id !== processToRun.id) { // Consider other processes
              // Next arrival of a potentially higher or same priority process
              if (p.arrivalTime > currentTime && p.arrivalTime < timeToNextEvent) {
                  timeToNextEvent = p.arrivalTime;
              }
          }
      });
  
      const timeToCompletion = currentTime + processToRun.remainingBurstTime;
      const runUntil = Math.min(timeToNextEvent, timeToCompletion);
      const runDuration = runUntil - currentTime;
  
      if (runDuration <= 0) {
          // If duration is 0 or less, advance time to next event if no better choice
          // Or handle case where a new higher priority process arrived at `currentTime`
          currentTime = Math.max(currentTime, processToRun.arrivalTime); // Ensure time advances
          if (timeToNextEvent === currentTime && timeToCompletion === currentTime) {
              if (processToRun.remainingBurstTime <= 0) {
                  // Fall through to completion check
              } else {
                  // Likely another process arrived or higher priority one is ready
                  // Let the next loop iteration pick the highest priority one
                  continue;
              }
          } else {
              currentTime = runUntil > currentTime ? runUntil : currentTime + (processes.length > completedCount ? 0.001 : 0); // Minimal advance if stuck or just continue
              continue;
          }
      }
  
      const ganttStart = currentTime;
      const ganttEnd = runUntil;
  
      if (lastGanttBlock && lastGanttBlock.id === processToRun.id && lastGanttBlock.end === ganttStart) {
          lastGanttBlock.end = ganttEnd;
      } else {
          lastGanttBlock = { id: processToRun.id, start: ganttStart, end: ganttEnd };
          ganttChart.push(lastGanttBlock);
      }
  
      processToRun.remainingBurstTime -= runDuration;
      currentTime = runUntil;
  
      if (processToRun.remainingBurstTime <= 0) {
        processToRun.isCompleted = true;
        processToRun.completionTime = currentTime;
        processToRun.turnaroundTime = processToRun.completionTime - processToRun.arrivalTime;
        processToRun.waitingTime = processToRun.turnaroundTime - processToRun.burstTime;
        completedProcessesData.push(processToRun);
        completedCount++;
        lastGanttBlock = null;
      }
    }
  
    completedProcessesData.sort((a, b) => a.originalIndex - b.originalIndex);
    const resultsTable = completedProcessesData.map(p => ({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority, // Include priority
      startTime: p.startTime,
      completionTime: p.completionTime,
      turnaroundTime: p.turnaroundTime,
      waitingTime: p.waitingTime,
    }));
  
    return { resultsTable, ganttChart };
  }
  
  module.exports = { calculatePriorityPreemptive };