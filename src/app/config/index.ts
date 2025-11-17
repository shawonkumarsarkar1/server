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
};
