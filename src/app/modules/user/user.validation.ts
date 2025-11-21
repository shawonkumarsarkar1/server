import z from 'zod';

const userRegistrationValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
  }),
});

export const userValidation = {
  userRegistrationValidationSchema,
};
