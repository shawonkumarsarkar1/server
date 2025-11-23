export interface IErrorSources {
  path: PropertyKey | undefined;
  message: string;
}

export interface IFnErrorResponse {
  statusCode: number;
  message: string;
  errorSources: IErrorSources[];
}
