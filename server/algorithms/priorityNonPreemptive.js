/**
 * Calculates scheduling metrics using Priority Non-Preemptive algorithm.
 * Assumes lower number means higher priority.
 *
 * @param {number[]} arrivalTimes
 * @param {number[]} burstTimes
 * @param {number[]} priorities
 * @returns {object|null}
 */
function calculatePriorityNonPreemptive(arrivalTimes, burstTimes, priorities) {
    // --- Input Validation ---
    if (!arrivalTimes || !burstTimes || !priorities ||
        arrivalTimes.length !== burstTimes.length ||
        arrivalTimes.length !== priorities.length ||
        arrivalTimes.length === 0) {
      console.error("Invalid input for Priority Non-Preemptive: Arrays invalid or mismatched lengths.");
      return null;
    }
    if (arrivalTimes.some(isNaN) || burstTimes.some(isNaN) || priorities.some(isNaN)) {
        console.error("Internal Priority NP Error: Non-numeric values found in arrays.");
        return null;
    }
    if (arrivalTimes.some(t => t < 0) || burstTimes.some(t => t <= 0) || priorities.some(p => typeof p !== 'number')) {
        console.error("Internal Priority NP Error: Invalid values in arrays (arrival >= 0, burst > 0, priority must be number).");
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
        originalIndex: i,
        isCompleted: false,
        startTime: 0,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
      });
    }
  
    let currentTime = 0;
    let completedCount = 0;
  
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
          ganttChart.push({ id: 'Idle', start: currentTime, end: minNextArrival });
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
  
      processToRun.startTime = currentTime;
      processToRun.completionTime = currentTime + processToRun.burstTime;
      processToRun.turnaroundTime = processToRun.completionTime - processToRun.arrivalTime;
      processToRun.waitingTime = processToRun.turnaroundTime - processToRun.burstTime;
  
      ganttChart.push({
        id: processToRun.id,
        start: processToRun.startTime,
        end: processToRun.completionTime
      });
  
      currentTime = processToRun.completionTime;
      processToRun.isCompleted = true;
      completedProcessesData.push(processToRun);
      completedCount++;
    }
  
    completedProcessesData.sort((a, b) => a.originalIndex - b.originalIndex);
    const resultsTable = completedProcessesData.map(p => ({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority, // Include priority in the table
      startTime: p.startTime,
      completionTime: p.completionTime,
      turnaroundTime: p.turnaroundTime,
      waitingTime: p.waitingTime,
    }));
  
    return { resultsTable, ganttChart };
  }
  
  module.exports = { calculatePriorityNonPreemptive };