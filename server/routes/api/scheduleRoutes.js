
const express = require('express');


const { processScheduleRequest } = require('../../controllers/scheduleController');

const router = express.Router();


/**
 * @route   POST /api/schedule/
 * @desc    Process a scheduling request (e.g., FCFS, SJF, RR)
 * @access  Public (adjust if authentication is added later)
 * @body    { algorithm: string, arrivalTimes: number[], burstTimes: number[], timeQuantum?: number }
 */
router.post(
    '/', // The path relative to where this router is mounted (e.g., '/api/schedule')
    processScheduleRequest // The controller function to execute when this route is matched
);


const { scheduleValidationRules, handleValidationErrors } = require('../../middleware/validators');
    router.post(
    scheduleValidationRules(), // 1. Apply validation rules
    handleValidationErrors,    // 2. Handle any validation errors
    processScheduleRequest     // 3. Call controller if valid
);


module.exports = router;