import { ZodError } from 'zod';
import { IErrorSources, IFnErrorResponse } from '../interface/error';

const handleZodError = (error: ZodError): IFnErrorResponse => {
  const statusCode = 400;
  const message = 'Validation Error';
  const errorSources: IErrorSources[] = error.issues.map(issue => {
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
