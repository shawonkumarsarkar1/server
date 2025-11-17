import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env['NODE_ENV'],
  port: process.env['PORT'],
  database_url: process.env['DATABASE_URL'] as string,
  frontend_url: process.env['FRONTEND_URL'],
  server_start_timeout: parseInt(
    process.env['SERVER_START_TIMEOUT'] ?? '30000'
  ),
  server_shutdown_timeout: parseInt(
    process.env['SERVER_SHUTDOWN_TIMEOUT'] ?? '10000'
  ),
  log_level: process.env['LOG_LEVEL'] as string,
  log_max_size: parseInt(process.env['LOG_MAX_SIZE'] ?? '20'),
  log_max_file_duration: parseInt(
    process.env['LOG_MAX_FILE_DURATION'] ?? '15d'
  ),
  log_error_retention: parseInt(process.env['LOG_ERROR_RETENTION'] ?? '30d'),
};
