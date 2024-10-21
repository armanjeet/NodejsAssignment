const express = require('express');
const cluster = require('cluster');
const os = require('os');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logTaskCompletion } = require('./logger');
const { processTask } = require('./taskQueue');

const numCPUs = os.cpus().length;

const app = express();
app.use(express.json());

const rateLimiter = new RateLimiterMemory({
  points: 20, 
  duration: 60, 
});

const rateLimiterPerUser = {};

app.post('/api/v1/task', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const userRateLimiter = rateLimiterPerUser[user_id] || new RateLimiterMemory({
    points: 1, 
    duration: 1,
  });

  try {
    await userRateLimiter.consume(user_id);
    await processTask(user_id);
    res.status(200).json({ message: 'Task processed' });
  } catch (rejRes) {
    setTimeout(async () => {
      await processTask(user_id);
      res.status(200).json({ message: 'Task queued and processed' });
    }, userRateLimiter.getTimeUntilNextConsume(user_id));
  }
});

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
