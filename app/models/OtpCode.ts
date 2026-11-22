import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtpCode extends Document {
  identifier: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const OtpCodeSchema = new Schema<IOtpCode>(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

if (mongoose.models.OtpCode) {
  delete mongoose.models.OtpCode;
}

const OtpCode: Model<IOtpCode> = mongoose.model<IOtpCode>(
  "OtpCode",
  OtpCodeSchema
);

export default OtpCode;