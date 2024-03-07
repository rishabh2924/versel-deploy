import { CatchAsyncError } from "../middleware/catchAsyncError";
import CommunityModel from "../models/communityModel";
import MemberModel from "../models/memberModel";
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const createCommunitySchema = z.object({
  name: z.string().min(2).max(128),
});

export const createCommunity = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      // Validate request body against schema
      const communityData = createCommunitySchema.parse(req.body);
      // Create a community
      const newCommunity = new CommunityModel({
        name: communityData.name,
        slug: communityData.name,
        owner: user.id,
      });

      // Save the community to the database
      await newCommunity.save();

      res.status(200).json({
        status: true,
        content: {
          data: {
            id: newCommunity.id,
            name: newCommunity.name,
            slug: newCommunity.slug,
            owner: newCommunity.owner,
            created_at: newCommunity.createdAt,
            updated_at: newCommunity.updatedAt,
          },
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all community
export const getAllCommunity = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pageString = req.query.page || "1";
      let page = parseInt(pageString as any);
      const limit = 10;

      // Count total number of documents
      const total = await CommunityModel.countDocuments();
      // Calculate total number of pages
      const totalPages = Math.ceil(total / limit);

      if (page > totalPages) {
        page = totalPages;
      }
      const skip = (page - 1) * limit;

      // Fetch communities with owner details, limiting fields to id and name
      const communities = await CommunityModel.find()
        .select("-_id")
        .populate({
          path: "owner",
          select: "id name",
          model: "User",
          foreignField: "id",
        })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        status: true,
        content: {
          meta: {
            total: total,
            pages: totalPages,
            page: page,
          },
          data: communities,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all member of one community

export const getCommunityMembers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const communityId = req.params.id;
      const pageString = req.query.page || "1";
      let page = parseInt(pageString as any);
      const limit = 10;

      const total = await MemberModel.countDocuments({
        community: communityId,
      });

      // Calculate total number of pages
      const totalPages = Math.ceil(total / limit);

      if (page > totalPages) {
        page = totalPages;
      }
      const skip = (page - 1) * limit;
      // Find members of the community

      const members = await MemberModel.find({ community: communityId })
        .select("-_id")
        .populate({
          path: "user",
          select: "-_id id name",
          model: "User",
          foreignField: "id",
        })
        .populate({
          path: "role",
          select: "-_id id name",
          model: "Role",
          foreignField: "id",
        })
        .skip(skip)
        .limit(limit);

      
      const responseObject = {
        status: true,
        content: {
          meta: {
            total: total,
            pages: totalPages,
            page: page,
          },
          data: members,
        },
      };

      res.status(200).json(responseObject);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get owner communities

export const getOwnerCommunities = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const pageString = req.query.page || "1";
      let page = parseInt(pageString as any);
      const limit = 10;

      const total = await CommunityModel.countDocuments({ owner: userId });

      // Calculate total number of pages
      const totalPages = Math.ceil(total / limit);

      if (page > totalPages) {
        page = totalPages;
      }
      const skip = (page - 1) * limit;
      const communities = await CommunityModel.find({ owner: userId })
        .select("-_id")
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        status: true,
        meta: {
          total: total,
          pages: totalPages,
          page: page,
        },
        content: {
          data: communities,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get Members communities
export const getMembersCommunities = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const pageString = req.query.page || "1";
      let page = parseInt(pageString as any);
      const limit = 10;

      const total = await MemberModel.countDocuments({ user: userId });

      // Calculate total number of pages
      const totalPages = Math.ceil(total / limit);

      if (page > totalPages) {
        page = totalPages;
      }
      const skip = (page - 1) * limit;

      const communities = await MemberModel.find({ user: userId })
        .select("-_id")
        .populate({
          path: "community",
          select: "-_id id name slug owner created_at updated_at",
          model: "Community",
          foreignField: "id",
          populate: {
            path: "owner",
            select: "id name",
            model: "User",
            foreignField: "id",
          },
        })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        status: true,
        content: {
          meta: {
            total,
            pages: totalPages,
            page,
          },
          //iterating over fetched data to match with response format
          data: communities.map((community) => ({
            id: community.community.id,
            name: community.community.name,
            slug: community.community.slug,
            owner: {
              id: community.community.owner.id,
              name: community.community.owner.name,
            },
            created_at: community.community.created_at,
            updated_at: community.community.updated_at,
          })),
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
