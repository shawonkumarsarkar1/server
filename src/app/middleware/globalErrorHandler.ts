/* eslint-disable @typescript-eslint/no-unused-vars */

import { ErrorRequestHandler } from 'express';
import config from '../config';

const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  req,
  res,
  _next
) => {
  const statusCode: number = 500;
  const message: string = 'Internal Server Error';
  const errorSource = [
    {
      path: '',
      message: 'Internal Server Error',
    },
  ];

  return res.status(statusCode).json({
    status: 'error',
    message,
    errors: {
      url: req.originalUrl,
      method: req.method,
      ...errorSource,
    },
    err,
    timestamp: new Date().toISOString(),
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
