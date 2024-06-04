const { format, createLogger, transports } = require('winston');
const { timestamp, combine, printf, colorize, errors } = format;

function buildDevLogger() {
  const myFormat = printf(({ level, message, timestamp, stack }) => {
    // Trimming the stack trace to show only relevant information
    let trimmedStack = stack;
    if (stack) {
      const stackLines = stack.split('\n');
      trimmedStack = stackLines.slice(0, 2).join('\n');
    }
    return `${timestamp}, ${level}, ${trimmedStack || message}`;
  });

  return createLogger({
    level: 'debug',
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      myFormat
    ),
    transports: [
      new transports.File({ filename: 'logs/project_logs.log' }) 
    ],
  });
}

module.exports = buildDevLogger;
