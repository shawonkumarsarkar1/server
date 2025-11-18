import IUser from './user.interface';
import userModel from './user.model';

const createUserIntoDB = async (payload: IUser): Promise<IUser> => {
  const data = await userModel.create(payload);
  return data;
};

export const userServices = {
  createUserIntoDB,
};
