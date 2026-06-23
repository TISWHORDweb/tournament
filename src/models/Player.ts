import mongoose, { Schema, models, model } from "mongoose";
import type { PaymentStatus, PlayerStatus, StackCategory, TeamGroup } from "@/lib/types";

export interface IPlayer {
  _id: string;
  registrationNumber: string;
  fullName: string;
  phone: string;
  email: string;
  slackUsername?: string | null;
  discordUsername?: string | null;
  category: StackCategory;
  group?: TeamGroup | null;
  status: PlayerStatus;
  paymentStatus: PaymentStatus;
  paystackReference?: string | null;
  registrationFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    registrationNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    slackUsername: { type: String, default: null },
    discordUsername: { type: String, default: null },
    category: {
      type: String,
      enum: ["BACKEND", "FRONTEND", "MOBILE", "UI_UX", "RESERVE"],
      required: true,
    },
    group: { type: String, enum: ["A", "B", null], default: null },
    status: { type: String, enum: ["PENDING", "APPROVED", "REMOVED"], default: "PENDING" },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    paystackReference: { type: String, unique: true, sparse: true },
    registrationFee: { type: Number, default: 150000 },
  },
  { timestamps: true }
);

export const Player = models.Player || model<IPlayer>("Player", PlayerSchema);
