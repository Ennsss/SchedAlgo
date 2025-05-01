/**
 * 
 * @param {number[]} arrivalTimes 
 * @param {number[]} burstTimes 
 * @returns {object|null}
 */
function calculateFcfs(arrivalTimes, burstTimes) {
  if (!arrivalTimes || !burstTimes || arrivalTimes.length !== burstTimes.length || arrivalTimes.length === 0) {
    console.error("Invalid input for FCFS calculation.");
    return null;
  }

  const n = arrivalTimes.length;
  const processes = [];

  //Create process objects with initial data and original index
  for (let i = 0; i < n; i++) {
    processes.push({
      id: `P${i + 1}`, 
      arrivalTime: arrivalTimes[i],
      burstTime: burstTimes[i],
      originalIndex: i, 
      startTime: 0,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
    });
  }

  // Sort processes based on arrival time (primary key)
  processes.sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    return a.originalIndex - b.originalIndex;
  });

  let currentTime = 0;
  const ganttChart = [];
  const completedProcesses = []; 

  // 3. Calculate metrics for each process in sorted order
  for (let i = 0; i < n; i++) {
    const process = processes[i];

    // Determine start time: process can't start before it arrives AND CPU is free
    process.startTime = Math.max(currentTime, process.arrivalTime);

    // Check for CPU idle time before this process starts
    if (process.startTime > currentTime) {
      ganttChart.push({
        id: 'Idle',
        start: currentTime,
        end: process.startTime,
      });
    }

    // Calculate completion time
    process.completionTime = process.startTime + process.burstTime;

    // Calculate turnaround time (Completion Time - Arrival Time)
    process.turnaroundTime = process.completionTime - process.arrivalTime;

    // Calculate waiting time (Turnaround Time - Burst Time)
    process.waitingTime = process.turnaroundTime - process.burstTime;

    // Update current time to when this process finishes
    currentTime = process.completionTime;

    // Add process execution to Gantt chart
    // Only add if burst time > 0, otherwise it's just an arrival event
    if (process.burstTime > 0) {
        ganttChart.push({
            id: process.id,
            start: process.startTime,
            end: process.completionTime,
          });
    }

    completedProcesses.push(process);
  }

  completedProcesses.sort((a, b) => a.originalIndex - b.originalIndex);

  const resultsTable = completedProcesses.map(p => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    startTime: p.startTime,
    completionTime: p.completionTime,
    turnaroundTime: p.turnaroundTime,
    waitingTime: p.waitingTime,
  }));


  return {
    resultsTable: resultsTable,
    ganttChart: ganttChart,
  };
}

// Export the function so it can be imported and used in the controller
module.exports = {
  calculateFcfs,
};