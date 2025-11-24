import { Response } from 'express';

interface IMeta {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
}

interface IResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
  meta?: IMeta;
}

const sendResponse = <T>(res: Response, resData: IResponse<T>): void => {
  const {
    statusCode = 200,
    message = 'Request completed successfully',
    data = [],
    meta,
  } = resData;
  const response = {
    success: true,
    message,
    data,
    meta,
  };

  res.status(statusCode).json(response);
};

export default sendResponse;
