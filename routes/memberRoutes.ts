import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createMember, deleteMember } from "../controllers/memberController";

const memberRouter = express.Router();

//routes

//create member
memberRouter.post("/member", isAuthenticated, createMember);

//delete member
memberRouter.delete("/member/:id", isAuthenticated, deleteMember);

export default memberRouter;
