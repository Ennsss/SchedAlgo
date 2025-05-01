const express = require('express');
const { processScheduleRequest } = require('../../controllers/scheduleController');
// ---> Ensure this line is NOT commented out <---
const { scheduleValidationRules, handleValidationErrors } = require('../../middleware/validators');

const router = express.Router();

// ---> Ensure the route includes the validation middleware <---
router.post(
  '/',
  scheduleValidationRules(), // Run validation rules first
  handleValidationErrors,    // Handle potential errors from rules
  processScheduleRequest     // Run controller only if validation passes
);

module.exports = router;