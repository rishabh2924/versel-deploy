import express from "express";
import {
  createCommunity,
  getAllCommunity,
  getCommunityMembers,
  getMembersCommunities,
  getOwnerCommunities,
} from "../controllers/communityControllers";
import { isAuthenticated } from "../middleware/auth";
const communityRouter = express.Router();

//routes

//create community
communityRouter.post("/community", isAuthenticated, createCommunity);

//get all community without auth
communityRouter.get("/community", getAllCommunity);

//get all community of member
communityRouter.get(
  "/community/me/member",
  isAuthenticated,
  getMembersCommunities
);

//get members of community
communityRouter.get("/community/:id/member", getCommunityMembers);

//get all community of owner
communityRouter.get(
  "/community/me/owner",
  isAuthenticated,
  getOwnerCommunities
);

export default communityRouter;
