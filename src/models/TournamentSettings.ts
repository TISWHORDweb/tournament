import { Schema, models, model } from "mongoose";

export interface ITournamentSettings {
  _id: string;
  registrationOpen: boolean;
  registrationDeadline: Date;
  registrationFee: number;
  tournamentName: string;
  tournamentTagline: string;
  updatedAt: Date;
}

const TournamentSettingsSchema = new Schema<ITournamentSettings>(
  {
    _id: { type: String, required: true },
    registrationOpen: { type: Boolean, default: true },
    registrationDeadline: { type: Date, required: true },
    registrationFee: { type: Number, default: 150000 },
    tournamentName: { type: String, default: "Tech Turf Championship" },
    tournamentTagline: {
      type: String,
      default: "Where Tech Professionals Battle on the Football Field",
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const TournamentSettings =
  models.TournamentSettings ||
  model<ITournamentSettings>("TournamentSettings", TournamentSettingsSchema);
