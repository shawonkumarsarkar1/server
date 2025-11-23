/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import handleZodError from '../error/handleZodError';
import { IErrorSources } from '../interface/error';
import handleValidationError from '../error/handleValidationError';
import mongoose from 'mongoose';
import handleCastError from '../error/handleCastError';
import handleDuplicateKeyError from '../error/handleDuplicateKeyError';
import AppError from '../error/appError';

const globalErrorHandler: ErrorRequestHandler = (
  error: Error & { code?: number },
  req,
  res,
  _next
) => {
  let statusCode: number = 500;
  let message: string = 'Internal Server Error';
  let errorSources: IErrorSources[] = [
    {
      path: '',
      message: 'Internal Server Error',
    },
  ];

  if (error instanceof ZodError) {
    const formattedError = handleZodError(error);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSources = formattedError.errorSources;
  } else if (error instanceof mongoose.Error.ValidationError) {
    const formattedError = handleValidationError(error);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSources = formattedError.errorSources;
  } else if (error instanceof mongoose.Error.CastError) {
    const formattedError = handleCastError(error);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSources = formattedError.errorSources;
  } else if (error.code === 11000) {
    const formattedError = handleDuplicateKeyError(error);
    statusCode = formattedError.statusCode;
    message = formattedError.message;
    errorSources = formattedError.errorSources;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [
      {
        path: '',
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error.message;
    errorSources = [
      {
        path: '',
        message: error.message,
      },
    ];
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
    errors: {
      errorSources,
      url: req.originalUrl,
      method: req.method,
    },
    stack: config.node_env === 'development' ? error?.stack : null,
    timestamp: new Date().toISOString(),
    error,
  });
};

export default globalErrorHandler;
