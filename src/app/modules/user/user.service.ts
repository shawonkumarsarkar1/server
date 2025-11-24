import IUser from './user.interface';
import userModel from './user.model';
import AppError from '../../error/AppError';

const getAllUsersFromDB = async (): Promise<IUser[]> => {
  const result = await userModel.find().lean();

  if (!result.length) {
    throw new AppError(404, 'No users found');
  }

  return result;
};

const getSingleUserFromDB = async (id: string): Promise<IUser> => {
  const result = await userModel.findById(id).lean();

  if (!result) {
    throw new AppError(404, 'User not found');
  }

  return result;
};

const createUserIntoDB = async (payload: IUser): Promise<IUser> => {
  const result = await userModel.create(payload);
  return result;
};

export const userServices = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  createUserIntoDB,
};
