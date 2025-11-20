import { IErrorResponse } from '../interface/error';

interface DuplicateKeyError extends Error {
  keyValue?: { [key: string]: string };
}

const handleDuplicateKeyError = (err: DuplicateKeyError): IErrorResponse => {
  const statusCode = 400;
  const errorPath = Object.keys(err?.keyValue ?? {})[0];
  const errorFieldValue =
    err?.keyValue && errorPath !== undefined
      ? err.keyValue[errorPath as keyof typeof err.keyValue]
      : '';
  const message = `Duplicate Key Error: A record with this field: '${errorPath}' and value: '${errorFieldValue}' already exists.`;
  const errorSource = {
    path: errorPath ?? '',
    value: errorFieldValue ?? '',
    message: `The ${errorPath} '${errorFieldValue}' is already exists. Please try a different ${errorPath}.`,
  };

  return {
    statusCode,
    message,
    errorSource,
  };
};

export default handleDuplicateKeyError;
