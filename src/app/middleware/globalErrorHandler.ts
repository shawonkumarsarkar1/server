/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import config from '../config';
import { IErrorSources } from '../interface/error';
import handleValidationError from '../error/handleValidationError';
import handleDuplicateKeyError from '../error/handleDuplicateKeyError';

const globalErrorHandler: ErrorRequestHandler = (
  err: Error & mongoose.Error.ValidationError & { code?: number },
  req,
  res,
  _next
) => {
  let statusCode: number = 500;
  let message: string = 'Internal Server Error';
  let errorSource: IErrorSources = {
    path: '',
    value: '',
    message: 'Internal Server Error',
  };

  // Handle duplicate key error first
  if (err.name === 'ValidationError') {
    const formattedError = handleValidationError(err);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSource = formattedError.errorSource;
    console.log('Validation Error Handled');
  } else if (err.code === 11000) {
    const formattedError = handleDuplicateKeyError(err);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSource = formattedError.errorSource;
    console.log('Duplicate Key Error Handled');
  }

  console.log('Global Error Handler Invoked:');

  return res.status(statusCode).json({
    status: 'error',
    message,
    errors: {
      url: req.originalUrl,
      method: req.method,
      ...errorSource,
    },
    timestamp: new Date().toISOString(),
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
