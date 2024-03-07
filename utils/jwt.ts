import { Response } from "express";
import { IUser } from "../models/userModal";

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();

  res.cookie("access_token", accessToken, { httpOnly: true, maxAge: 3600000 });

  res.status(statusCode).json({
    status: true,
    content: {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.createdAt,
      },
      meta: {
        access_token: accessToken,
      },
    },
  });
};
