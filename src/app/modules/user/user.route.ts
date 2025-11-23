import { Router } from 'express';
import { userControllers } from './user.controller';
import validateRequest from '../../middleware/validateRequest';
import { userValidation } from './user.validation';

const router = Router();

router.post(
  '/create',
  validateRequest(userValidation.userRegistrationValidationSchema),
  userControllers.createUser
);

export const userRoutes = router;
