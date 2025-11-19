/* eslint-disable @typescript-eslint/no-explicit-any */
import { IErrorSources } from '../interface/error';

const handleDuplicateKeyError = (err): IErrorSources => {
  const statusCode = 400;
  const message = 'Duplicate Key Error: A record with this key already exists.';
  const errorSource = {
    path: 
  }

  return {
    statusCode,
    message,
    errorSource,
  };
};

export default handleDuplicateKeyError;
