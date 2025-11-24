import mongoose from 'mongoose';
import { IErrorSources, IFnErrorResponse } from '../interface/error';

const handleCastError = (error: mongoose.Error.CastError): IFnErrorResponse => {
  const statusCode = 400;
  const message = 'Invalid ID';
  const errorSources: IErrorSources[] = [
    {
      path: '',
      message: error.message,
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleCastError;
