interface IUser {
  name: string;
  email: string;
  phoneNo: string;
  password: string;
  isDeleted?: boolean;
}

export default IUser;
