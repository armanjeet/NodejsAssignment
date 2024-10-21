const { logTaskCompletion } = require('./logger');

const taskQueue = [];

const processTask = async (user_id) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  logTaskCompletion(user_id);
};

module.exports = { processTask };
