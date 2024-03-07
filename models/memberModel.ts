const mongoose = require("mongoose");
import { Snowflake } from "@theinternetfolks/snowflake";
import { Model } from "mongoose";
import { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IMember extends Document {
  id: string;
  community: string;
  user: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Member Schema
const memberSchema: Schema<IMember> = new mongoose.Schema(
  {
    id: {
      type: String,

      default: Snowflake.generate(),
      required: true,
      unique: true,
    },
    community: {
      type: String,
      required: true,
      ref: "Community",
      localField: "id",
    },
    user: {
      type: String,
      required: true,
      ref: "User",
      localField: "id",
    },
    role: {
      type: String,
      required: true,
      ref: "Role",
      localField: "id",
    },
  },
  { timestamps: true }
);

// Create Member model
const MemberModel: Model<IMember> = mongoose.model("Member", memberSchema);
export default MemberModel;
