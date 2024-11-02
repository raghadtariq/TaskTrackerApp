
# Task Tracker Application

## Introduction

Welcome to the Task Tracker Application! This project demonstrates a task management app built using Redis as a key-value database and Docker to create a distributed environment with master and slave nodes. It efficiently manages tasks with features like adding tasks, retrieving them, marking them as completed, and managing tasks by priority.

## Project Overview

The Task Tracker Application is designed to:
- Use **Redis** as the database for storing and managing tasks, with a master-slave setup for distributed data handling.
- Enable efficient task operations with key Redis features.
- Use **Docker** to create isolated containers for the Redis master and slave instances.

## Features

1. **Add Task** - Store task details with a unique ID and track them with a hash structure.
2. **Retrieve Tasks** - Fetch all tasks stored in Redis.
3. **Mark Task as Complete** - Update task status to complete and apply a Time-To-Live (TTL).
4. **Add Task with Priority** - Manage tasks by priority using a Redis sorted set.
5. **Load Balancing** - Evenly distribute read requests across slave nodes.

## Technologies Used

- **Node.js** - Backend server to handle API requests.
- **Redis** - Key-value store for managing tasks in a distributed setup.
- **Docker** - Containerizes the Redis instances with a master and two slaves.
- **Postman** - Used for API testing.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/raghadtariq/TaskTrackerApp.git
cd TaskTrackerApp
```

### 2. Docker Setup for Redis

This project uses Docker containers to create isolated environments for Redis. The `docker-compose.yml` file specifies the configuration for Redis master and slave instances.

### 3. Start Docker Containers

Run the following command to start the containers:

```bash
docker-compose up --build -d
```

This will set up Redis master and slave instances and the Node.js application.

---

## API Endpoints

| Endpoint                                  | Method | Description               |
|-------------------------------------------|--------|---------------------------|
| `/api/task`                               | POST   | Add a new task            |
| `/api/tasks`                              | GET    | Retrieve all tasks        |
| `/api/task/complete`                      | POST   | Mark task as completed    |
| `/api/task/priority`                      | POST   | Add a task with priority  |
| `/api/tasks/priority`                     | GET    | Get tasks by priority     |

### Example Request to Add Task

```http
POST http://localhost:3000/api/task
Body: { "description": "My new task" }
```

---

## Key Functionalities

### Redis Commands in Use

- **Add Task (`addTask`)**: Uses `hSet` to store task details in a hash, identified by `task:<timestamp>`.
- **Retrieve Tasks (`getTasks`)**: Uses `keys('task:*')` and `hGetAll` to retrieve all task details.
- **Complete Task (`completeTask`)**: Sets `status` to `completed` and applies a TTL (86400 seconds, or 24 hours) to automatically remove completed tasks.
- **Priority Task (`addTaskWithPriority`)**: Uses `zAdd` to add tasks to a sorted set, ordered by priority.
- **Get Tasks by Priority (`getTasksWithPriority`)**: Uses `zRange` to retrieve tasks in order of priority.

### Load Balancing

The application implements **round-robin load balancing** for read requests. This distributes read requests across Redis slave nodes, reducing the load on individual nodes and improving overall performance.

### Failover Simulation

If the master node is down, read operations continue from the slave nodes. However, write operations will fail, demonstrating how data availability is maintained for reads in case of master node failure.

To simulate a failover, run:

```bash
docker stop redis-master
```

---


## Frontend Interface

- **HTML and CSS**: Basic frontend available at `public/index.html` with styles in `public/style.css`.
- The frontend communicates with the backend to display and manage tasks.

---

## Running the Application

Once the containers are up, you can access the Task Tracker Application endpoints at `http://localhost:3000`.

---

## Conclusion

This Task Tracker application demonstrates using Redis in a master-slave configuration within Docker to build a distributed, efficient task management system. With essential features and a scalable setup, this project highlights how Redis and Docker can work together for high-performance applications.

---

## Author

Developed by **Raghad Darabee**

