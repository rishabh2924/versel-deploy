const mongoose = require("mongoose");
import { Snowflake } from "@theinternetfolks/snowflake";
import { Model } from "mongoose";
import { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IRole extends Document {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Role Schema
const roleSchema: Schema<IRole> = new mongoose.Schema(
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
      unique: true,
    },
  },
  { timestamps: true }
);

// Create Role model
const RoleModel: Model<IRole> = mongoose.model("Role", roleSchema);
export default RoleModel;
