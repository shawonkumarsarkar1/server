import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import IUser from './user.interface';
import { userServices } from './user.service';
import sendSuccessResponse from '../../response/sendSuccessResponse';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IUser;
  const data = await userServices.createUserIntoDB(payload);

  sendSuccessResponse({ res, data });
});

export const userControllers = {
  createUser,
};
