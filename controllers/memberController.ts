import { CatchAsyncError } from "../middleware/catchAsyncError";
import CommunityModel from "../models/communityModel";
import MemberModel from "../models/memberModel";
import RoleModel from "../models/roleModel";
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Types } from "mongoose";

const createMemberSchema = z.object({
  community: z.string(),
  user: z.string(),
  role: z.string(),
});

export const createMember = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Validate request body against schema
      const memberData = createMemberSchema.parse(req.body);

      // Find the community where the owner matches the user's ID
      const ownedCommunity = await CommunityModel.findOne({
        id: memberData.community,
        owner: user.id,
      });
      if (!ownedCommunity) {
        return next(new ErrorHandler("Not Allowed Access", 403));
      }
      //validate roleId
      const roleIDExist = await RoleModel.findOne({ id: memberData.role });

      // Create a member
      const newMember = new MemberModel({
        community: memberData.community,
        user: memberData.user,
        role: memberData.role,
      });
      await newMember.save();

      res.status(200).json({
        status: true,
        content: {
          data: {
            id: newMember.id,
            community: newMember.community,
            user: newMember.user,
            role: newMember.role,
            created_at: newMember.createdAt,
          },
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteMember = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { id } = req.params;

      //find the member with the id
      const member = await MemberModel.findOne({ id: id });
      if (!member) {
        return next(new ErrorHandler("Member not found", 404));
      }

      //find the community where the owner matches the user's ID
      const community = await CommunityModel.findOne({
        owner: user?.id,
        id: member?.community,
      });

      //if user is not owner then check for moderator
      if (!community) {

        //find role where role is Community Moderator
        const role = await RoleModel.findOne({ name: "Community Moderator" });

        //check in member whether user with this role and community exist
        const memberData = await MemberModel.findOne({
          user: user?.id,
          role: role?.id,
          community: member?.community,
        });
        if (!memberData) {
          return next(new ErrorHandler("Not Allowed Access", 403));
        }
      }

      //delete the member
      await MemberModel.findOneAndDelete({ id: id });
      res.status(200).json({
        status: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
