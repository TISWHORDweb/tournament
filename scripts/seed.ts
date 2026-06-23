import "dotenv/config";
import mongoose from "mongoose";
import { Announcement } from "../src/models/Announcement";
import { TournamentSettings } from "../src/models/TournamentSettings";

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is required");

  await mongoose.connect(uri);

  await TournamentSettings.findOneAndUpdate(
    { _id: "default" },
    {
      _id: "default",
      tournamentName: "Tech Turf Championship",
      tournamentTagline: "Where Tech Professionals Battle on the Football Field",
      registrationOpen: true,
      registrationDeadline: new Date("2026-09-12T23:59:59Z"),
      registrationFee: 150000,
    },
    { upsert: true, new: true }
  );

  const existing = await Announcement.countDocuments();
  if (existing === 0) {
    await Announcement.insertMany([
      {
        title: "Registration Now Open!",
        content:
          "Registration for the Tech Turf Championship is officially open. Secure your spot in your stack team before slots fill up!",
        type: "NEWS",
      },
      {
        title: "Tournament Day — September 12",
        content:
          "Mark your calendars! The Tech Turf Championship kicks off on September 12, 2026. Venue details will be announced soon.",
        type: "MATCH",
      },
      {
        title: "Fixture Release Coming Soon",
        content:
          "Group stage fixtures will be published two weeks before kickoff. Stay tuned for the full schedule.",
        type: "FIXTURE",
      },
    ]);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
