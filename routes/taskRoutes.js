const express = require('express');
const {
    addTask,
    getTasks,
    completeTask,
    addTaskWithPriority,
    getTasksWithPriority
} = require('../controllers/taskController');

const router = express.Router();

router.post('/task', addTask);
router.get('/tasks', getTasks);
router.post('/task/complete', completeTask);

router.post('/task/priority', addTaskWithPriority);
router.get('/tasks/priority', getTasksWithPriority);

module.exports = router;
