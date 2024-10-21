const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logFilePath = path.join(__dirname, 'task_log.txt');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, message }) => {
      return `${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: logFilePath }),
  ],
});

const logTaskCompletion = (user_id) => {
  const message = `${user_id} - task completed at - ${Date.now()}`;
  logger.info(message);
};

module.exports = { logTaskCompletion };
