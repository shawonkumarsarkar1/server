import { IErrorResponse } from '../interface/error';

interface DuplicateKeyError extends Error {
  keyValue?: { [key: string]: string };
}

const handleDuplicateKeyError = (err: DuplicateKeyError): IErrorResponse => {
  const statusCode = 400;
  const errorField = Object.keys(err?.keyValue ?? {})[0];
  const errorFieldValue =
    err?.keyValue && errorField !== undefined
      ? err.keyValue[errorField as keyof typeof err.keyValue]
      : '';
  const message = `Duplicate Key Error: A record with this field: '${errorField}' and value: '${errorFieldValue}' already exists.`;
  const errorSource = {
    field: errorField,
    value: errorFieldValue,
    message: `The ${errorField} '${errorFieldValue}' is already exists. Please try a different ${errorField}.`,
  };

  return {
    statusCode,
    message,
    errorSource,
  };
};

export default handleDuplicateKeyError;
