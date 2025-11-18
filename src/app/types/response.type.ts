import { Response } from 'express';

interface IResponse {
  res: Response;
  statusCode?: number;
  message?: string;
}

export interface ISuccessResponseParams<T> extends IResponse {
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
