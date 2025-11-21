import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import catchAsync from '../utils/catchAsync';

interface IValidationData {
  body: unknown;
  cookies: unknown;
}

const validateRequest = (
  schema: z.ZodTypeAny
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const validationData: IValidationData = {
        body: req.body,
        cookies: req.cookies,
      };

      await schema.parseAsync(validationData);

      next();
    }
  );
};

export default validateRequest;
