require('dotenv').config(); 
const { createClient } = require('redis');

let masterClient;
let slaveClients = [];

async function connectToRedis() {
    try {
        masterClient = createClient({ url: `redis://${process.env.REDIS_MASTER_HOST}:${process.env.REDIS_MASTER_PORT}` });
        slaveClients = [
            createClient({ url: `redis://${process.env.REDIS_SLAVE1_HOST}:${process.env.REDIS_SLAVE1_PORT}` }),
            createClient({ url: `redis://${process.env.REDIS_SLAVE2_HOST}:${process.env.REDIS_SLAVE2_PORT}` })
        ];

        masterClient.on('error', (err) => {
            console.error('Master Redis connection error:', err.message);
        });

        slaveClients.forEach((client, index) => {
            client.on('error', (err) => {
                console.error(`Slave Redis connection error (Slave ${index + 1}):`, err.message);
            });
        });

        await Promise.all([
            masterClient.connect(),
            ...slaveClients.map(client => client.connect())
        ]);
        console.log('Connected to Redis master and slaves');
    } catch (err) {
        console.error('Error connecting to Redis:', err.message);
    }
}

let readClientIndex = 0;
const getReadClient = () => {
    return slaveClients[readClientIndex++ % slaveClients.length];
};

const addTask = async (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).send('Task is required');

    try {
        const taskId = `task:${Date.now()}`;
        await masterClient.hSet(taskId, {
            description: task,
            created_at: new Date().toISOString(),
            status: 'pending'
        });
        res.send(`Task added with ID: ${taskId}`);
    } catch (err) {
        console.error('Failed to write to master:', err);
        return res.status(500).send('Error adding task: master Redis is down.');
    }
};

const getTasks = async (req, res) => {
    let keys;

    try {
        const client = getReadClient();
        keys = await client.keys('task:*');
    } catch (err) {
        console.error('Error retrieving keys from slave:', err);
        
        readClientIndex = (readClientIndex + 1) % slaveClients.length;
        const client = getReadClient();
        try {
            keys = await client.keys('task:*');
        } catch (secondErr) {
            console.error('Both slaves failed:', secondErr);
            return res.status(500).send('Error retrieving tasks. Both slaves are down.');
        }
    }

    try {
        const tasks = await Promise.all(keys.map(key => getReadClient().hGetAll(key)));
        res.json({ tasks });
    } catch (err) {
        console.error('Error retrieving tasks from slaves:', err);
        return res.status(500).send('Error retrieving tasks from slaves.');
    }
};

const completeTask = async (req, res) => {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).send('Task ID is required');

    try {
        await masterClient.hSet(taskId, 'status', 'completed');
        await masterClient.expire(taskId, 86400); // Set TTL of 24 hours
        res.send(`Task marked as completed: ${taskId}`);
    } catch (err) {
        console.error('Failed to write to master:', err);
        return res.status(500).send('Could not mark task as completed. Master is down.');
    }
};

const addTaskWithPriority = async (req, res) => {
    const { task, priority } = req.body;
    if (!task || priority === undefined) return res.status(400).send('Task and priority are required');

    try {
        const taskId = `priorityTask:${Date.now()}`;
        await masterClient.zAdd('tasksWithPriority', { score: priority, value: taskId });
        await masterClient.hSet(taskId, {
            description: task,
            priority,
            created_at: new Date().toISOString(),
            status: 'pending'
        });
        res.send(`Priority task added with ID: ${taskId}`);
    } catch (err) {
        console.error('Error adding priority task:', err);
        return res.status(500).send('Could not add task with priority. Master is down.');
    }
};

const getTasksWithPriority = async (req, res) => {
    try {
        const taskIds = await getReadClient().zRange('tasksWithPriority', 0, -1);
        const tasks = await Promise.all(taskIds.map(taskId => getReadClient().hGetAll(taskId)));
        res.json({ tasks });
    } catch (err) {
        console.error('Error retrieving priority tasks:', err);
        return res.status(500).send('Could not retrieve tasks with priority. Slave is down.');
    }
};

module.exports = {
    connectToRedis,
    addTask,
    getTasks,
    completeTask,
    addTaskWithPriority,
    getTasksWithPriority
};
