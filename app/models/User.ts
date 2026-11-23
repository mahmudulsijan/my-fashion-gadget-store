import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  provider: string;
  district?: string;
  address?: string;
  verified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: String,
      default: "email",
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;