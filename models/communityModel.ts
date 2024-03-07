const mongoose = require("mongoose");
import { Snowflake } from "@theinternetfolks/snowflake";
import { Model } from "mongoose";
import { Schema } from "mongoose";
import { Document } from "mongoose";

export interface ICommunity extends Document {
  id: string;
  name: string;
  slug: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}
// Define Community Schema
const communitySchema: Schema<ICommunity> = new mongoose.Schema(
  {
    id: {
      type: String,
      default: Snowflake.generate(),
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 128,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    owner: {
      type: String,
      required: true,
      ref: "User",
      localField: "id",
    },
  },
  { timestamps: true }
);

// Create Community model
const CommunityModel: Model<ICommunity> = mongoose.model(
  "Community",
  communitySchema
);
export default CommunityModel;
