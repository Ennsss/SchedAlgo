
const { calculateFcfs } = require('../algorithms/fcfs.js');
const { calculateRr } = require('../algorithms/rr.js');
const { calculateSjf } = require('../algorithms/sjf.js');
const { calculateSrtf } = require('../algorithms/srtf.js');
const { calculatePriorityNonPreemptive } = require('../algorithms/priorityNonPreemptive.js');
const { calculatePriorityPreemptive } = require('../algorithms/priorityPreemptive.js');

const processScheduleRequest = async (req, res, next) => {
    try {
        const { algorithm, arrivalTimes, burstTimes } = req.body;
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
             return res.status(400).json({ message: 'Invalid input: Arrays cannot be empty.' });
        }
        const containsNonNumeric = (arr) => arr.some(val => typeof val !== 'number' || isNaN(val));
        if (containsNonNumeric(arrivalTimes) || containsNonNumeric(burstTimes)) {
             return res.status(400).json({ message: 'Invalid input: arrivalTimes and burstTimes arrays must only contain numbers.' });
        }

        let results;
        const upperCaseAlgorithm = algorithm.toUpperCase().trim();
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
                const { timeQuantum } = req.body;       
                const parsedTimeQuantum = parseInt(timeQuantum, 10); 
                if (isNaN(parsedTimeQuantum) || typeof parsedTimeQuantum !== 'number' || parsedTimeQuantum <= 0) {
                    return res.status(400).json({ message: 'Invalid input: Positive integer timeQuantum required for Round Robin algorithm.' });
                }
                results = calculateRr(arrivalTimes, burstTimes, parsedTimeQuantum);
                break;
            case 'PRIORITY-NP': // Or "PRIORITY (NON-PREEMPTIVE)" - match frontend value
                const { priorities: prioritiesNp } = req.body; // Get priorities array
                // Add validation for prioritiesNp array here if not using express-validator
                if (!prioritiesNp || !Array.isArray(prioritiesNp) || prioritiesNp.length !== arrivalTimes.length || prioritiesNp.some(isNaN)) {
                    return res.status(400).json({ message: 'Invalid input: Valid priorities array matching process count required for Priority Non-Preemptive.'});
                }
                results = calculatePriorityNonPreemptive(arrivalTimes, burstTimes, prioritiesNp);
                break;
        
            case 'PRIORITY-P': // Or "PRIORITY (PREEMPTIVE)"
                const { priorities: prioritiesP } = req.body; // Get priorities array
                 // Add validation for prioritiesP array here
                if (!prioritiesP || !Array.isArray(prioritiesP) || prioritiesP.length !== arrivalTimes.length || prioritiesP.some(isNaN)) {
                    return res.status(400).json({ message: 'Invalid input: Valid priorities array matching process count required for Priority Preemptive.'});
                }
                results = calculatePriorityPreemptive(arrivalTimes, burstTimes, prioritiesP);
                break;
            default:
               return res.status(400).json({ message: `Algorithm '${algorithm}' not supported.` });
        }
 
        if (results === null) {  
            console.error(`Calculation failed for algorithm: ${upperCaseAlgorithm}`);
            return res.status(400).json({ message: 'Calculation error: Input might be invalid or unsuitable for the chosen algorithm\'s internal logic.' });
        }
        




    return res.status(200).json(results);
    } catch (error) {
        
        console.error(`Unexpected error processing schedule request for algorithm ${req.body?.algorithm}:`, error);
        
        next(error);
      
         return res.status(500).json({ message: 'Internal Server Error occurred.' });
    }
};

module.exports = { processScheduleRequest };