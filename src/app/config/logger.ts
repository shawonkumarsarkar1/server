import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import config from '.';

const logsDir = path.join(process.cwd(), 'logs');
void (async () => {
  try {
    await fs.promises.access(logsDir);
  } catch {
    await fs.promises.mkdir(logsDir, { recursive: true });
  }
})();

const logger = winston.createLogger({
  level: config.log_level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  defaultMeta: {
    service: 'server',
    environment: config.node_env,
  },

  exitOnError: false,

  transports: [
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: config.log_max_size,
      maxFiles: config.log_max_file_duration,
      zippedArchive: true,
    }),

    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: config.log_max_size,
      maxFiles: config.log_error_retention,
      level: 'error',
      zippedArchive: true,
    }),
  ],
});

if (config.node_env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${String(timestamp)} [${String(level)}]: ${String(message)} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

logger.on('error', (error: Error) => {
  console.error('❌ Logger error:', error);
});

export default logger;
