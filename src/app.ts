import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import logger from './app/config/logger';
import config from './app/config';
import { appRoutes } from './app/routes';

const app: Application = express();

const corsOptions = {
  origin: config.frontend_url,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

if (config.node_env === 'production') {
  app.use(
    morgan('combined', {
      stream: { write: message => logger.info(message.trim()) },
      skip: req => req.url === '/health',
    })
  );
} else {
  app.use(morgan('dev'));
}

app.get('/', (_req: Request, res: Response) => {
  logger.info('Root endpoint accessed');

  res.json({
    message: 'Server is running!',
    timeStamp: new Date().toISOString(),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  logger.info('Health check endpoint accessed');

  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.use('/api/v1/server', appRoutes);

export default app;
