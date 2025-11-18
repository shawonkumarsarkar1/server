import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import IUser from './user.interface';
import { userServices } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IUser;
  const data = await userServices.createUserIntoDB(payload);

  res.status(200).json({
    success: true,
    message: 'user created successfully',
    data,
  });
});

export const userControllers = {
  createUser,
};
