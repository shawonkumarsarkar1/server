import mongoose from 'mongoose';
import { IErrorSources, IFnErrorResponse } from '../interface/error';

const handleValidationError = (
  error: mongoose.Error.ValidationError
): IFnErrorResponse => {
  const statusCode = 400;
  const message = 'Validation Error';
  const errorSources: IErrorSources[] = Object.values(error.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    }
  );

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleValidationError;
