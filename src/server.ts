import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import {
  DatabaseAuthError,
  DatabaseConnectionError,
  DatabaseTimeoutError,
  ShutdownError,
} from './app/types/error.type';
import config from './app/config';

let server: Server;
let isShuttingDown = false;
let shutdownTimeout: NodeJS.Timeout | undefined;

const mongoOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
  retryReads: true,
  maxIdleTimeMS: 30000,
};

const classifyDatabaseError = (
  error: unknown,
  retries: number
): DatabaseConnectionError => {
  if (error instanceof mongoose.Error) {
    if (
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongoTimeoutError'
    ) {
      return new DatabaseTimeoutError(
        `Database timeout after ${retries + 1} attempts: ${error.message}`,
        retries
      );
    }

    if (error.name === 'MongoNetworkError') {
      return new DatabaseConnectionError(
        `Network error connecting to database: ${error.message}`,
        'DATABASE_NETWORK_ERROR',
        retries
      );
    }

    if (
      error.name === 'MongoServerError' &&
      'code' in error &&
      error.code === 18
    ) {
      return new DatabaseAuthError(
        `Database authentication failed: ${error.message}`
      );
    }
  }

  return new DatabaseConnectionError(
    `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    'DATABASE_CONNECTION_ERROR',
    retries
  );
};

const connectDatabase = async (): Promise<void> => {
  const maxRetries = 5;
  let lastError: DatabaseConnectionError | undefined = undefined;

  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      await mongoose.connect(config.database_url, mongoOptions);
      console.info('✅ Database connected successfully');
      return;
    } catch (error: unknown) {
      lastError = classifyDatabaseError(error, retries);
      const delay = Math.min(2000 * Math.pow(2, retries), 10000);

      console.error(
        `❌ Database connection failed (attempt ${retries + 1}/${maxRetries}):`,
        lastError.message
      );

      if (retries < maxRetries - 1) {
        console.info(`Retrying connection in ${delay}ms...`);
        await new Promise<void>(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw (
    lastError ??
    new DatabaseConnectionError(
      'Unknown error during database connection attempts'
    )
  );
};

const initiateShutdown = (exitCode: number): void => {
  if (shutdownTimeout) {
    clearTimeout(shutdownTimeout);
    shutdownTimeout = undefined;
  }

  setImmediate(() => {
    console.info(`Process exiting with code: ${exitCode}`);

    if (exitCode !== 0) {
      console.error('Application terminated with errors');
    }
  });
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    console.info(`Shutdown already in progress, ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  console.info(`\n${signal} received, initiating graceful shutdown...`);

  try {
    const shutdownPromises: Array<Promise<void>> = [];

    const shutdownTimer = new Promise<void>((_, reject) => {
      shutdownTimeout = setTimeout(
        () => reject(new ShutdownError('Shutdown timeout exceeded', signal)),
        config.server_shutdown_timeout
      );
    });

    if (server?.listening) {
      shutdownPromises.push(
        new Promise<void>((resolve, reject) => {
          server.close((error?: Error) => {
            if (error) {
              reject(
                new ShutdownError(
                  `HTTP server close failed: ${error.message}`,
                  signal
                )
              );
            } else {
              console.info('✅ HTTP server closed gracefully');
              resolve();
            }
          });
        })
      );
    }

    if (
      mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected
    ) {
      shutdownPromises.push(
        mongoose.connection
          .close(false)
          .then(() => {
            console.info('✅ Database connection closed gracefully');
          })
          .catch((err: Error) => {
            throw new ShutdownError(
              `Database close failed: ${err.message}`,
              signal
            );
          })
      );
    }

    if (shutdownPromises.length === 0) {
      console.info('No active connections to close');
      return;
    }

    await Promise.race([
      Promise.allSettled(shutdownPromises).then(results => {
        const errors = results
          .filter(
            (result): result is PromiseRejectedResult =>
              result.status === 'rejected'
          )
          .map((result: PromiseRejectedResult) => result.reason as Error);

        if (errors.length > 0) {
          throw new ShutdownError(
            `Shutdown completed with ${errors.length} error(s): ${errors.map(e => e.message).join(', ')}`,
            signal
          );
        }

        console.info('✅ All shutdown operations completed successfully');
      }),
      shutdownTimer,
    ]);

    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout);
      shutdownTimeout = undefined;
    }

    console.info('🎯 Graceful shutdown completed');
    initiateShutdown(0);
  } catch (error: unknown) {
    console.error(
      '❌ Error during shutdown:',
      error instanceof Error ? error.message : String(error)
    );

    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout);
      shutdownTimeout = undefined;
    }

    initiateShutdown(1);
  }
};

const main = async (): Promise<void> => {
  try {
    await connectDatabase();

    mongoose.connection.on('connected', () => {
      console.info('🔗 Mongoose connected to database cluster');
    });

    mongoose.connection.on('disconnected', () => {
      console.info('🔌 Mongoose disconnected from database');
      if (!isShuttingDown) {
        console.error('🚨 Unexpected database disconnection detected');
        void gracefulShutdown('UNEXPECTED_DISCONNECTION');
      }
    });

    mongoose.connection.on('error', (err: Error) => {
      console.error('💥 Mongoose connection error:', err);
      if (!isShuttingDown) {
        void gracefulShutdown('DATABASE_ERROR');
      }
    });

    const serverStartPromise = new Promise<void>((resolve, reject) => {
      server = app.listen(config.port, () => {
        console.info(`🚀 Server running on port ${config.port}`);
        console.info(`📊 Environment: ${config.node_env ?? 'development'}`);
        console.info(
          `⏰ Server start timeout: ${config.server_start_timeout}ms`
        );
        resolve();
      });

      server.on('error', reject);
    });

    await Promise.race([
      serverStartPromise,
      new Promise<void>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Server start timeout after ${config.server_start_timeout}ms`
              )
            ),
          config.server_start_timeout
        )
      ),
    ]);

    server.on('error', (error: Error) => {
      console.error('❌ Server runtime error:', error);
      if (!isShuttingDown) {
        void gracefulShutdown('SERVER_ERROR');
      }
    });

    console.info('✅ Application bootstrap sequence completed successfully');
  } catch (error: unknown) {
    console.error('💥 Critical failure during application bootstrap:', error);

    if (error instanceof DatabaseConnectionError) {
      console.error(
        '🔧 Database connectivity issue - check configuration and network'
      );
    }

    await gracefulShutdown('STARTUP_FAILURE');
  }
};

process.on('SIGTERM', () => {
  console.info('📡 SIGTERM received from orchestrator');
  void gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.info('⌨️  SIGINT received from terminal');
  void gracefulShutdown('SIGINT');
});

process.on(
  'unhandledRejection',
  (error: unknown, promise: Promise<unknown>) => {
    console.error(
      '🚨 Unhandled Promise Rejection at:',
      promise,
      'reason:',
      error
    );
    void gracefulShutdown('UNHANDLED_REJECTION');
  }
);

process.on('uncaughtException', (error: Error, origin: string) => {
  console.error('🚨 Uncaught Exception:', error, 'origin:', origin);
  void gracefulShutdown('UNCAUGHT_EXCEPTION');
});

void main();
