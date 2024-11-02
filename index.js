require('dotenv').config(); 
const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const { connectToRedis } = require('./controllers/taskController'); 

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static('public'));

connectToRedis().catch(err => {
    console.error('Error initializing Redis connections:', err);
});

app.use('/api', taskRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
