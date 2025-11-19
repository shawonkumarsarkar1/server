import { ErrorRequestHandler } from 'express';
import config from '../config';
import { IErrorSources } from '../interface/error';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode: number = 500;
  const message: string = 'Internal Server Error';
  const errorSource: IErrorSources = {
    path: req.originalUrl,
    message: 'Internal Server Error',
  };

  return res.status(statusCode).json({
    status: 'error',
    message: err.message,
    errorSource,
    stack: config.node_env === 'development' ? err.stack : null,
    timestamp: new Date().toISOString(),
    err,
  });
};

export default globalErrorHandler;
