import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { z } from "zod";
import userModel from "../models/userModal";
import { sendToken } from "../utils/jwt";

const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  //strong password validation
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
});

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const userData = registrationSchema.parse(req.body);

      // Check if user with the same email already exists
      const existingUser = await userModel.findOne({ email: userData.email });
      if (existingUser) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      // Create a new user
      const newUser = new userModel({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      // Save the user to the database
      await newUser.save();

      //Send response with JWT token , user id and store cookies
      sendToken(newUser, 201, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Define Zod schema for login request
const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Password must be at least 6 characters long
});

// Login controller
export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const { email, password } = loginRequestSchema.parse(req.body);

      // Find user by email
      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      // Check if password matches
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      //Send response with JWT token , user id and store cookies
      sendToken(user, 200, res);
    } catch (error: any) {
      // If validation fails or any other error occurs, respond with error message
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get user info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      res.status(200).json({
        status: true,
        content: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.createdAt,
          },
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
