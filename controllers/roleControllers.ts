import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { z } from "zod";
import RoleModel from "../models/roleModel";

const createRoleSchema = z.object({
  name: z.string().min(2).max(128),
});

//create role
export const createRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const roleData = createRoleSchema.parse(req.body);
      // Create a role
      const newRole = new RoleModel({
        name: roleData.name,
      });
      await newRole.save();
      res.status(200).json({
        status: true,
        content: {
          data: {
            id: newRole.id,
            name: newRole.name,
            created_at: newRole.createdAt,
            updated_at: newRole.updatedAt,
          },
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all roles
export const getAllRoles = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pageString = req.query.page || "1";
      let page = parseInt(pageString as any);
      const limit = 10;

      // Count total number of documents
      const total = await RoleModel.countDocuments();
      // Calculate total number of pages
      const totalPages = Math.ceil(total / limit);

      if (page > totalPages) {
        page = totalPages;
      }
      const skip = (page - 1) * limit;
      const roles = await RoleModel.find()
        .select("-_id")
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
          data: roles,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
