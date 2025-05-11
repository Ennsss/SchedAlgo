// server/controllers/scheduleController.js

// Import all algorithm calculation functions
const { calculateFcfs } = require('../algorithms/fcfs.js');
const { calculateSjf } = require('../algorithms/sjf.js'); // Assuming you created this
const { calculateSrtf } = require('../algorithms/srtf.js'); // Assuming you created this
const { calculateRr } = require('../algorithms/rr.js');     // Assuming you created this
const { calculatePriorityNonPreemptive } = require('../algorithms/priorityNonPreemptive.js');
const { calculatePriorityPreemptive } = require('../algorithms/priorityPreemptive.js');

const processScheduleRequest = async (req, res, next) => {
    try {
        // 1. Extract data from request body
        //    timeQuantum and priorities are optional depending on the algorithm
        const { algorithm, arrivalTimes, burstTimes, timeQuantum, priorities } = req.body;

        // 2. Basic Input Validation (Crucial before passing to algorithms)
        //    (More robust validation can be done with express-validator middleware)
        if (!algorithm || typeof algorithm !== 'string' || algorithm.trim() === '') {
            return res.status(400).json({ message: 'Invalid input: Algorithm name is required and must be a non-empty string.' });
        }
        if (!arrivalTimes || !burstTimes || !Array.isArray(arrivalTimes) || !Array.isArray(burstTimes)) {
            return res.status(400).json({ message: 'Invalid input: arrivalTimes and burstTimes must be provided as arrays.' });
        }
        if (arrivalTimes.length !== burstTimes.length) {
            return res.status(400).json({ message: 'Invalid input: arrivalTimes and burstTimes arrays must have the same length.' });
        }
        if (arrivalTimes.length === 0) {
             return res.status(400).json({ message: 'Invalid input: Input arrays cannot be empty.' });
        }
        // Basic check for numeric values (algorithms should do more thorough checks)
        const containsNonNumeric = (arr) => arr.some(val => typeof val !== 'number' || isNaN(val));
        if (containsNonNumeric(arrivalTimes) || containsNonNumeric(burstTimes)) {
             return res.status(400).json({ message: 'Invalid input: arrivalTimes and burstTimes arrays must only contain numbers.' });
        }
        // Ensure arrival times are non-negative and burst times are positive
        if (arrivalTimes.some(t => t < 0) || burstTimes.some(t => t <= 0)) {
            return res.status(400).json({ message: 'Invalid input: Arrival times must be non-negative, and burst times must be positive.' });
        }


        let results;
        const upperCaseAlgorithm = algorithm.toUpperCase().trim(); // Use trimmed, uppercase for comparison

        // 3. Select and call the appropriate algorithm function
        switch (upperCaseAlgorithm) {
            case 'FCFS':
                results = calculateFcfs(arrivalTimes, burstTimes);
                break;

            case 'SJF':
                results = calculateSjf(arrivalTimes, burstTimes);
                break;

            case 'SRTF':
                results = calculateSrtf(arrivalTimes, burstTimes);
                break;

            case 'RR':
                const parsedTimeQuantum = parseInt(timeQuantum, 10);
                if (isNaN(parsedTimeQuantum) || typeof parsedTimeQuantum !== 'number' || parsedTimeQuantum <= 0) {
                    return res.status(400).json({ message: 'Invalid input: Positive integer timeQuantum required for Round Robin algorithm.' });
                }
                results = calculateRr(arrivalTimes, burstTimes, parsedTimeQuantum);
                break;

            case 'PRIORITY-NP': // Match the value from your frontend select option
                if (!priorities || !Array.isArray(priorities) || priorities.length !== arrivalTimes.length || containsNonNumeric(priorities)) {
                    return res.status(400).json({ message: 'Invalid input: Valid priorities array (all numbers, same length as processes) required for Priority Non-Preemptive.'});
                }
                results = calculatePriorityNonPreemptive(arrivalTimes, burstTimes, priorities);
                break;

            case 'PRIORITY-P': // Match the value from your frontend select option
                if (!priorities || !Array.isArray(priorities) || priorities.length !== arrivalTimes.length || containsNonNumeric(priorities)) {
                    return res.status(400).json({ message: 'Invalid input: Valid priorities array (all numbers, same length as processes) required for Priority Preemptive.'});
                }
                results = calculatePriorityPreemptive(arrivalTimes, burstTimes, priorities);
                break;

            default:
                // Handle unsupported algorithm type
                return res.status(400).json({ message: `Algorithm '${algorithm}' not supported.` });
        }

        // 4. Handle cases where algorithm function indicates an error (e.g., returns null)
        if (results === null) {
            console.error(`Calculation returned null for algorithm: ${upperCaseAlgorithm}`);
            return res.status(400).json({ message: 'Calculation error: Input might be invalid or unsuitable for the chosen algorithm\'s internal logic.' });
        }

        // 5. Send successful response
        return res.status(200).json(results);

    } catch (error) {
        // 6. Handle unexpected server errors
        console.error(`Unexpected error processing schedule request for algorithm ${req.body?.algorithm}:`, error);
        // Pass error to the next middleware (your global error handler in server.js)
        next(error);
    }
};

// Export the handler function
module.exports = {
  processScheduleRequest,
};