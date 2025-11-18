/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import formatTimestamp12Hour from '../utils/formatTimestamp12Hour';

interface INotFoundResponse {
  status: 'Error';
  message: string;
  error: {
    path: string;
    method: string;
  };
  suggestion?: string;
  timestamp: string;
}

const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  const response: INotFoundResponse = {
    status: 'Error',
    message: `The requested resource '${req.originalUrl}' was not found on this server.`,
    error: {
      path: req.originalUrl,
      method: req.method,
    },
    suggestion: 'Check the api endpoint and try again',
    timestamp: formatTimestamp12Hour(),
  };

  res.status(404).json(response);
};

export default notFound;
