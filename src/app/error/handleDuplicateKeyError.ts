import { IErrorSources, IFnErrorResponse } from '../interface/error';

interface DuplicateKeyError extends Error {
  keyValue?: { [key: string]: string };
}

const handleDuplicateKeyError = (
  error: DuplicateKeyError
): IFnErrorResponse => {
  const statusCode = 400;
  const message = 'Bad Request - Duplicate Key Error';
  const errorPath = Object.keys(error?.keyValue ?? {})[0];
  const errorFieldValue =
    error?.keyValue && errorPath !== undefined
      ? error.keyValue[errorPath as keyof typeof error.keyValue]
      : '';
  const errorSources: IErrorSources[] = [
    {
      path: errorPath,
      message: `The ${errorPath} '${errorFieldValue}' is already exists.`,
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleDuplicateKeyError;
