import { connectDB } from "@/lib/db";
import { Announcement, IAnnouncement } from "@/models/Announcement";
import { IPayment, Payment } from "@/models/Payment";
import { IPlayer, Player } from "@/models/Player";
import { ITournamentSettings, TournamentSettings } from "@/models/TournamentSettings";
import { GROUP_CAPACITY, RESERVE_CAPACITY } from "@/lib/constants";
import { PaymentStatus, PlayerStatus, StackCategory, TeamGroup } from "@/lib/types";
import { buildOccupancyKey, OccupancyMap } from "@/lib/utils";

function playerId(doc: { _id: unknown }) {
  return String(doc._id);
}

export async function getActivePlayers() {
  await connectDB();
  return Player.find({
    status: { $ne: "REMOVED" },
    paymentStatus: "PAID",
  })
    .sort({ createdAt: 1 })
    .lean<IPlayer[]>();
}

export async function getOccupancyMap(): Promise<OccupancyMap> {
  const players = await getActivePlayers();
  const map: OccupancyMap = {};

  for (const player of players) {
    const key = buildOccupancyKey(player.category, player.group ?? null);
    map[key] = (map[key] ?? 0) + 1;
  }

  return map;
}

export async function getSlotCount(category: StackCategory, group: TeamGroup | null): Promise<number> {
  const map = await getOccupancyMap();
  const key = buildOccupancyKey(category, group);
  return map[key] ?? 0;
}

export async function isSlotAvailableFor(
  category: StackCategory,
  group: TeamGroup | null
): Promise<boolean> {
  const count = await getSlotCount(category, group);
  if (category === "RESERVE") return count < RESERVE_CAPACITY;
  if (!group) return false;
  return count < GROUP_CAPACITY;
}

export async function getTournamentSettings(): Promise<ITournamentSettings> {
  await connectDB();
  const existing = await TournamentSettings.findOne({ _id: "default" }).lean<ITournamentSettings>();
  if (existing) {
    return {
      _id: String(existing._id),
      registrationOpen: existing.registrationOpen,
      registrationDeadline: existing.registrationDeadline,
      registrationFee: existing.registrationFee,
      tournamentName: existing.tournamentName,
      tournamentTagline: existing.tournamentTagline,
      updatedAt: existing.updatedAt,
    };
  }

  const created = await TournamentSettings.create({
    _id: "default",
    registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    registrationFee: 150000,
  });
  return created.toObject();
}

export async function saveTournamentSettings(data: {
  registrationOpen?: boolean;
  registrationDeadline?: Date;
  registrationFee?: number;
  tournamentName?: string;
  tournamentTagline?: string;
}) {
  await connectDB();
  const existing = await TournamentSettings.findOne({ _id: "default" });
  if (existing) {
    Object.assign(existing, data);
    await existing.save();
    return existing.toObject();
  }
  return (
    await TournamentSettings.create({
      _id: "default",
      registrationDeadline: data.registrationDeadline ?? new Date(Date.now() + 30 * 86400000),
      registrationFee: data.registrationFee ?? 150000,
      ...data,
    })
  ).toObject();
}

export type AdminPlayer = {
  id: string;
  registrationNumber: string;
  fullName: string;
  phone: string;
  email: string;
  slackUsername: string | null;
  discordUsername: string | null;
  category: StackCategory;
  group: TeamGroup | null;
  status: string;
  paymentStatus: string;
  paystackReference: string | null;
  registrationFee: number;
  createdAt: Date;
  payment: {
    reference: string;
    amount: number;
    status: string;
    paidAt: Date | null;
  } | null;
};

export async function getAllPlayersForAdmin(): Promise<AdminPlayer[]> {
  await connectDB();
  const players = await Player.find().sort({ createdAt: -1 }).lean<IPlayer[]>();
  const payments = await Payment.find().lean();
  const paymentMap = new Map(payments.map((p) => [p.playerId, p]));

  return players.map((p) => {
    const payment = paymentMap.get(playerId(p));
    return {
      id: playerId(p),
      registrationNumber: p.registrationNumber,
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      slackUsername: p.slackUsername ?? null,
      discordUsername: p.discordUsername ?? null,
      category: p.category,
      group: p.group ?? null,
      status: p.status,
      paymentStatus: p.paymentStatus,
      paystackReference: p.paystackReference ?? null,
      registrationFee: p.registrationFee,
      createdAt: p.createdAt,
      payment: payment
        ? {
            reference: payment.reference,
            amount: payment.amount,
            status: payment.status,
            paidAt: payment.paidAt ?? null,
          }
        : null,
    };
  });
}

export async function getDashboardMetrics() {
  await connectDB();
  const [players, payments, settings] = await Promise.all([
    Player.find({ status: { $ne: "REMOVED" } }).lean(),
    Payment.find().lean(),
    getTournamentSettings(),
  ]);

  const paidPlayers = players.filter((p) => p.paymentStatus === "PAID");
  const occupancy = await getOccupancyMap();
  const totalOccupied = Object.values(occupancy).reduce((s, n) => s + n, 0);
  const revenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);

  return {
    totalRegistrations: players.length,
    totalPlayers: paidPlayers.length,
    totalPayments: payments.filter((p) => p.status === "PAID").length,
    availableSlots: 82 - totalOccupied,
    reservePlayers: occupancy["RESERVE"] ?? 0,
    revenue,
    settings,
  };
}

export type AdminAnnouncement = {
  id: string;
  title: string;
  content: string;
  type: import("@/lib/types").AnnouncementType;
  published: boolean;
  publishedAt: Date;
};

export async function getPublishedAnnouncements(): Promise<AdminAnnouncement[]> {
  await connectDB();
  const docs = await Announcement.find({ published: true }).sort({ publishedAt: -1 }).lean<IAnnouncement[]>();
  return docs.map((a) => ({
    id: String(a._id),
    title: a.title,
    content: a.content,
    type: a.type,
    published: a.published,
    publishedAt: a.publishedAt,
  }));
}

export type PlayerConfirmation = {
  id: string;
  registrationNumber: string;
  fullName: string;
  category: StackCategory;
  group: TeamGroup | null;
  paymentStatus: string;
  paystackReference: string | null;
  createdAt: Date;
  payment: {
    reference: string;
    amount: number;
    status: string;
    paidAt: Date | null;
  } | null;
};

export async function getPlayerByRegistrationNumber(
  registrationNumber: string
): Promise<PlayerConfirmation | null> {
  await connectDB();
  const player = await Player.findOne({ registrationNumber }).lean<IPlayer>();
  if (!player) return null;
  const payment = await Payment.findOne({ playerId: playerId(player) }).lean<IPayment>();
  return {
    id: playerId(player),
    registrationNumber: player.registrationNumber,
    fullName: player.fullName,
    category: player.category,
    group: player.group ?? null,
    paymentStatus: player.paymentStatus,
    paystackReference: player.paystackReference ?? null,
    createdAt: player.createdAt,
    payment: payment
      ? {
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt ?? null,
        }
      : null,
  };
}

export async function getPlayerByReference(reference: string) {
  await connectDB();
  const player = await Player.findOne({ paystackReference: reference }).lean<IPlayer>();
  if (!player) return null;
  const payment = await Payment.findOne({ playerId: playerId(player) }).lean<IPayment>();
  return { ...player, id: playerId(player), payment };
}

export type PlayersByTeam = Record<
  string,
  Array<{ id: string; fullName: string; registrationNumber: string; createdAt: Date }>
>;

export async function getPlayersGroupedByTeam(): Promise<PlayersByTeam> {
  const players = await getActivePlayers();
  const grouped: PlayersByTeam = {};

  for (const player of players) {
    const key = buildOccupancyKey(player.category, player.group ?? null);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: playerId(player),
      fullName: player.fullName,
      registrationNumber: player.registrationNumber,
      createdAt: player.createdAt,
    });
  }

  return grouped;
}

export async function approvePlayerAfterPayment(playerIdStr: string, reference: string) {
  await connectDB();
  const player = await Player.findByIdAndUpdate(
    playerIdStr,
    {
      paymentStatus: "PAID" as PaymentStatus,
      status: "APPROVED" as PlayerStatus,
      paystackReference: reference,
    },
    { new: true }
  ).lean<IPlayer>();

  await Payment.findOneAndUpdate(
    { playerId: playerIdStr },
    { status: "PAID" as PaymentStatus, paidAt: new Date() }
  );

  return player;
}
