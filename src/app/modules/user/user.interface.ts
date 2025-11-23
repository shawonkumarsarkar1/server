interface IUser {
  name: string;
  age: number;
  email: string;
  password: string;
  isDeleted?: boolean;
}

export default IUser;
