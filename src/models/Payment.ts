import mongoose, { Schema, models, model } from "mongoose";
import type { PaymentStatus } from "@/lib/types";

export interface IPayment {
  _id: string;
  playerId: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  channel?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    playerId: { type: String, required: true, unique: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    channel: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);
