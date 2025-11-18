import { ISuccessResponseParams } from '../types/response.type';

const sendSuccessResponse = <T>(params: ISuccessResponseParams<T>): void => {
  if (params?.res === null || params?.res === undefined) {
    throw new Error('Invalid parameters passed to sendSuccessResponse');
  }

  const { res, statusCode = 200, message, data } = params;
  const response = {
    status: 'success',
    message: message ?? 'Request completed successfully',
    data: data ?? [],
  };

  res.status(statusCode).json(response);
};

export default sendSuccessResponse;
