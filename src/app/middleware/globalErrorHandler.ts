/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import config from '../config';
import { IErrorSources } from '../interface/error';
import handleZodError from '../error/handleZodError';
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

  if (err instanceof ZodError) {
    const formattedError = handleZodError(err);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSource = formattedError.errorSource;
  }
  if (err.name === 'ValidationError') {
    const formattedError = handleValidationError(err);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSource = formattedError.errorSource;
  } else if (err.code === 11000) {
    const formattedError = handleDuplicateKeyError(err);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSource = formattedError.errorSource;
  }

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
    err,
  });
};

export default globalErrorHandler;
