import { Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "@repo/validation";
import { prisma } from "@repo/db";
import { compare, hash } from "@repo/crypto/bcrypt";
import { createToken } from "@repo/crypto/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    // Input Data Validation
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }

    const { name, email, password } = validation.data;

    // Email Uniqueness check
    const emailExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (emailExist) {
      res.status(400).json({ message: "Email already registered." });
      return;
    }

    // Hashing Password
    const hashedPassword = hash(password);

    // Registering User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Creating the JWT Token
    const token = createToken({ id: user.id });

    // Sending the Response
    res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error("Error in registering user: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Input Data Validation
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }

    // Finding the user
    const { email, password } = validation.data;
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password." });
      return;
    }

    //Matching the password
    const isPasswordMatch = compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(400).json({ message: "Invalid email or password." });
      return;
    }

    // Creating the JWT Token
    const token = createToken({ id: user.id });

    // Sending the Response
    res.status(200).json({
      message: "Logged in successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error("Error in logging user: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const payload = req.user!;
    const { id, token } = payload;
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
    });
    res.status(200).json({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        token,
      },
    });
  } catch (error) {
    console.error("Error in getting user info: ", error);
    res.status(500).json({ messgae: "Internal server error." });
  }
};
