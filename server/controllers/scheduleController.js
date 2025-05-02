
const { calculateFcfs } = require('../algorithms/fcfs.js');
const { calculateRr } = require('../algorithms/roundrobin.js');


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
            case 'RR':
                const { timeQuantum } = req.body; // Get timeQuantum from request body
                // Add validation for timeQuantum if not using express-validator yet
                if (timeQuantum === undefined || typeof timeQuantum !== 'number' || timeQuantum <= 0 || !Number.isInteger(timeQuantum)) {
                    // Send 400 error if timeQuantum is missing/invalid
                    return res.status(400).json({message: 'Invalid input: Positive integer timeQuantum required for Round Robin'});
                }
                results = calculateRr(arrivalTimes, burstTimes, timeQuantum);
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