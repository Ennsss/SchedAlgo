

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If errors exist, send 400 Bad Request response with error details
    return res.status(400).json({ errors: errors.array() });
  }
  // No errors, proceed to the next middleware (the controller)
  next();
};

// Define the validation rules for the schedule request body
const scheduleValidationRules = () => {
  return [
    // --- Algorithm Validation ---
    body('algorithm')
      .exists({ checkFalsy: true }).withMessage('Algorithm is required.') // Must exist and not be empty string, null, undefined etc.
      .isString().withMessage('Algorithm must be a string.')
      .trim() // Remove leading/trailing whitespace
      .notEmpty().withMessage('Algorithm cannot be empty.'),
      // .isIn(['FCFS', 'SJF', 'RR']).withMessage('Algorithm must be FCFS, SJF, or RR'), // Optional: Restrict allowed algorithms

    // --- arrivalTimes Validation ---
    body('arrivalTimes')
      .exists().withMessage('arrivalTimes is required.')
      .isArray({ min: 1 }).withMessage('arrivalTimes must be a non-empty array.'),
    body('arrivalTimes.*') // Validate each element in the array
      .isNumeric({ no_symbols: false }).withMessage('Each arrival time must be a number.')
      .toFloat() // Convert valid numeric strings to numbers
      .custom((value) => value >= 0).withMessage('Arrival times cannot be negative.'),

    // --- burstTimes Validation ---
    body('burstTimes')
      .exists().withMessage('burstTimes is required.')
      .isArray({ min: 1 }).withMessage('burstTimes must be a non-empty array.'),
    body('burstTimes.*') // Validate each element
      .isNumeric({ no_symbols: false }).withMessage('Each burst time must be a number.')
      .toFloat() // Convert valid numeric strings to numbers
      .custom((value) => value > 0).withMessage('Burst times must be positive (greater than zero).'), // Burst time usually > 0

    // --- Array Length Check ---
    body('burstTimes').custom((value, { req }) => {
      // Check if arrivalTimes exists (previous rules ensure it's an array if it exists)
      if (req.body.arrivalTimes && value.length !== req.body.arrivalTimes.length) {
        throw new Error('arrivalTimes and burstTimes arrays must have the same length.');
      }
      return true; // Indicates validation passed
    }),

    // --- Conditional Time Quantum Validation ---
    body('timeQuantum')
      .if(body('algorithm').toUpperCase().equals('RR')) // Only run this validation if algorithm is 'RR' (case-insensitive)
      .exists({checkFalsy: true}).withMessage('timeQuantum is required for Round Robin algorithm.')
      .isInt({ gt: 0 }).withMessage('timeQuantum must be a positive integer.')
      .toInt() // Convert valid integer string to number
  ];
};

module.exports = {
  scheduleValidationRules,
  handleValidationErrors,
};