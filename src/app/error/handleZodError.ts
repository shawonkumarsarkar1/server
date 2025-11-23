import { ZodError } from 'zod';
import { IFnErrorResponse } from '../interface/error';

const handleZodError = (error: ZodError): IFnErrorResponse => {
  const statusCode = 400;
  const message = 'Validation Error';
  const errorSources = error.issues.map(issue => {
    return {
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleZodError;
