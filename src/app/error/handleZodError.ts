import { ZodError } from 'zod';
import { IErrorResponse, IErrorSources } from '../interface/error';
import { $ZodIssue } from 'zod/v4/core';

const handleZodError = (err: ZodError): IErrorResponse => {
  const statusCode = 400;
  const message = 'Validation Error';
  const errorSource: IErrorSources = err.issues.map((issue : $ZodIssue) => {
    console.log(issue);
    return {
      path: issue?.path[1],
      value: issue?.received,
      message: issue.message,
    };
  })[0];

  return {
    statusCode,
    message,
    errorSource,
  };
};

export default handleZodError;
