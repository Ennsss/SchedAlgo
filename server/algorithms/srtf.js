// Shortest Remaining Time First (SRTF) Scheduling Algorithm
/**
 * Calculates scheduling metrics using the Shortest Job First (SJF) Non-Preemptive algorithm.
 *
 * @param {number[]} arrivalTimes - Array of arrival times for each process.
 * @param {number[]} burstTimes - Array of burst times for each process.
 * @returns {object|null} An object containing resultsTable and ganttChart arrays, or null if input is invalid.
 */

function srtf(processes) {
    const n = processes.length;
    let time = 0;
    let completed = 0;
    let shortest = -1;
    let minRemainingTime = Infinity;
    let isProcessRunning = false;

    const waitingTime = Array(n).fill(0);
    const turnaroundTime = Array(n).fill(0);
    const remainingTime = processes.map(p => p.burstTime);

    while (completed !== n) {
        for (let i = 0; i < n; i++) {
            if (
                processes[i].arrivalTime <= time &&
                remainingTime[i] > 0 &&
                remainingTime[i] < minRemainingTime
            ) {
                shortest = i;
                minRemainingTime = remainingTime[i];
                isProcessRunning = true;
            }
        }

        if (!isProcessRunning) {
            time++;
            continue;
        }

        remainingTime[shortest]--;
        minRemainingTime = remainingTime[shortest];

        if (remainingTime[shortest] === 0) {
            completed++;
            isProcessRunning = false;
            minRemainingTime = Infinity;

            const finishTime = time + 1;
            turnaroundTime[shortest] = finishTime - processes[shortest].arrivalTime;
            waitingTime[shortest] = turnaroundTime[shortest] - processes[shortest].burstTime;
        }

        time++;
    }

    return processes.map((process, i) => ({
        processId: process.id,
        waitingTime: waitingTime[i],
        turnaroundTime: turnaroundTime[i],
    }));
}

// Example usage
const processes = [
    { id: 1, arrivalTime: 0, burstTime: 8 },
    { id: 2, arrivalTime: 1, burstTime: 4 },
    { id: 3, arrivalTime: 2, burstTime: 9 },
    { id: 4, arrivalTime: 3, burstTime: 5 },
];

const result = srtf(processes);
console.log(result);