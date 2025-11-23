/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import handleZodError from '../error/handleZodError';
import { IErrorSources } from '../interface/error';

const globalErrorHandler: ErrorRequestHandler = (
  error: Error,
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
  }

  return res.status(statusCode).json({
    status: 'error',
    message,
    errors: {
      errorSources,
      url: req.originalUrl,
      method: req.method,
      ...error,
    },
    stack: config.node_env === 'development' ? error?.stack : null,
    timestamp: new Date().toISOString(),
    error,
  });
};

export default globalErrorHandler;
