import { z } from "zod";

export const RegisterSchema = z.strictObject({
  name: z
    .string()
    .min(6, { message: "Name must be atleast 6 characters long." })
    .max(255, { message: "Name should not be more than 255 characters." }),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long." })
    .max(20, { message: "Password should not be more than 20 characters." }),
});


export const LoginSchema = z.strictObject({
    email: z.string().email(),
    password: z.string().min(6).max(20)
});
