import mongoose, { Schema, models, model } from "mongoose";
import type { AnnouncementType } from "@/lib/types";

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  published: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["MATCH", "FIXTURE", "TEAM_UPDATE", "VENUE", "NEWS"],
      default: "NEWS",
    },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Announcement =
  models.Announcement || model<IAnnouncement>("Announcement", AnnouncementSchema);
