import mongoose, { Model, Schema } from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const emailRegexPattern: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
export interface IUser extends mongoose.Document {
  id: string; // Snowflake ID
  name: string | null;
  email: string;
  password: string;
  createdAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
}

// Define User Schema
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    id: {
      type: String,
      default: Snowflake.generate(), // Generating Snowflake ID as default
      unique: true,
      required: true,
    },
    name: {
      type: String,
      maxlength: 64,
      default: null,
    },
    email: {
      type: String,
      maxlength: 128,
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
      required: true,
    },
    password: {
      type: String,
      maxlength: 64,
      minlength: 8,
      required: true,
    },
  },
  { timestamps: true, id: false }
);

// Hash Password before saving

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5d",
  });
};


//compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create User model
const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;
