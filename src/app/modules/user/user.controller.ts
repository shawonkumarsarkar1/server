import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import IUser from './user.interface';
import { userServices } from './user.service';
import sendResponse from '../../utils/sendResponse';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IUser;
  const data = await userServices.createUserIntoDB(payload);

  sendResponse(res, {
    statusCode: 201,
    message: 'User created successfully',
    data,
  });
});

export const userControllers = {
  createUser,
};
