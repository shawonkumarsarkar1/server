import mongoose from 'mongoose';
import { IErrorResponse } from '../interface/error';

const handleValidationError = (
  err: mongoose.Error.ValidationError
): IErrorResponse => {
  const statusCode = 400;
  const message = 'Validation Error';
  const errors = Object.values(err.errors);
  const firstError = errors[0];
  const errorSource = {
    path: firstError?.path ?? '',
    value: '',
    message: firstError?.message ?? 'Validation error occurred',
  };

  return {
    statusCode,
    message,
    errorSource,
  };
};

export default handleValidationError;
