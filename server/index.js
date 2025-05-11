require('dotenv').config(); 
//import express and cors
const express = require('express'); 
const cors = require('cors');       


const validators = require('./middleware/validators'); // Assuming you have this

const app = express();
const PORT = process.env.PORT || 5000;

//use cors and express as a middleware
app.use(cors());
app.use(express.json());

scheduleRoutes = require('./routes/api/scheduleRoutes');
app.use('/api/schedule', scheduleRoutes);

//Global Error Handling
app.use((err, _req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
      message: 'Something went wrong on the server!',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

//call the port 
app.get('/', (_req, res) => {
    res.status(200).send('Server is running');
  });
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
