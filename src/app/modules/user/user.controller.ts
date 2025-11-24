import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import IUser from './user.interface';
import { userServices } from './user.service';
import sendResponse from '../../utils/sendResponse';

const getAllUser = catchAsync(async (_req: Request, res: Response) => {
  const result = await userServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: 200,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IUser;
  const result = await userServices.createUserIntoDB(payload);

  sendResponse(res, {
    statusCode: 201,
    message: 'User created successfully',
    data: result,
  });
});

export const userControllers = {
  getAllUser,
  createUser,
};
