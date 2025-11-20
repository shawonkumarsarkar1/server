/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import config from '../config';
import { IErrorSources } from '../interface/error';
import handleDuplicateKeyError from '../error/handleDuplicateKeyError';

const globalErrorHandler: ErrorRequestHandler = (
  err: Error & { code?: number },
  req,
  res,
  _next
) => {
  let statusCode: number = 500;
  let message: string = 'Internal Server Error';
  let errorSource: IErrorSources = {
    field: '',
    value: '',
    message: 'Internal Server Error',
  };

  // Handle duplicate key error first
  if (err.code === 11000) {
    const formattedError = handleDuplicateKeyError(err);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSource = formattedError.errorSource;
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
    errors: {
      path: req.originalUrl,
      method: req.method,
      ...errorSource,
    },
    timestamp: new Date().toISOString(),
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
