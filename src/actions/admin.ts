"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { Player } from "@/models/Player";
import { clearAdminSession, isAdminAuthenticated, setAdminSession, verifyAdminPassword } from "@/lib/auth";
import { isSlotAvailableFor, saveTournamentSettings } from "@/lib/tournament";
import { AnnouncementType, PlayerStatus, StackCategory, TeamGroup } from "@/lib/types";

async function requireAdmin() {
  const authed = await isAdminAuthenticated();
  if (!authed) throw new Error("Unauthorized");
}

export async function adminLogin(password: string) {
  if (!verifyAdminPassword(password)) {
    return { success: false, error: "Invalid password." };
  }
  await setAdminSession();
  return { success: true };
}

export async function adminLogout() {
  await clearAdminSession();
  return { success: true };
}

export async function updatePlayer(
  playerId: string,
  data: {
    fullName?: string;
    phone?: string;
    email?: string;
    slackUsername?: string | null;
    discordUsername?: string | null;
    category?: StackCategory;
    group?: TeamGroup | null;
    status?: PlayerStatus;
  }
) {
  await requireAdmin();
  await connectDB();

  if (data.category !== undefined || data.group !== undefined) {
    const player = await Player.findById(playerId);
    if (!player) return { success: false, error: "Player not found." };

    const category = data.category ?? player.category;
    const group = category === "RESERVE" ? null : (data.group ?? player.group);

    if (category !== "RESERVE" && !group) {
      return { success: false, error: "Group is required for stack players." };
    }

    const othersCount = await Player.countDocuments({
      _id: { $ne: playerId },
      status: { $ne: "REMOVED" },
      paymentStatus: "PAID",
      category,
      group,
    });

    const max = category === "RESERVE" ? 10 : 9;
    if (othersCount >= max) {
      return { success: false, error: "Target slot is full." };
    }

    await Player.findByIdAndUpdate(playerId, { ...data, group });
  } else {
    await Player.findByIdAndUpdate(playerId, data);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/teams");
  revalidatePath("/");
  return { success: true };
}

export async function removePlayer(playerId: string) {
  await requireAdmin();
  await connectDB();
  await Player.findByIdAndUpdate(playerId, { status: "REMOVED" });
  revalidatePath("/admin/dashboard");
  revalidatePath("/teams");
  revalidatePath("/");
  return { success: true };
}

export async function approvePlayer(playerId: string) {
  await requireAdmin();
  await connectDB();
  await Player.findByIdAndUpdate(playerId, { status: "APPROVED" });
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function transferPlayer(
  playerId: string,
  category: StackCategory,
  group: TeamGroup | null
) {
  await requireAdmin();
  await connectDB();

  const available = await isSlotAvailableFor(category, group);
  if (!available) return { success: false, error: "Target slot is full." };

  await Player.findByIdAndUpdate(playerId, {
    category,
    group: category === "RESERVE" ? null : group,
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/teams");
  revalidatePath("/");
  return { success: true };
}

export async function promoteFromReserve(playerId: string, category: StackCategory, group: TeamGroup) {
  return transferPlayer(playerId, category, group);
}

export async function moveToReserve(playerId: string) {
  return transferPlayer(playerId, "RESERVE", null);
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  type: AnnouncementType;
  published?: boolean;
}) {
  await requireAdmin();
  await connectDB();
  await Announcement.create(data);
  revalidatePath("/announcements");
  revalidatePath("/");
  return { success: true };
}

export async function updateAnnouncement(
  id: string,
  data: { title?: string; content?: string; type?: AnnouncementType; published?: boolean }
) {
  await requireAdmin();
  await connectDB();
  await Announcement.findByIdAndUpdate(id, data);
  revalidatePath("/announcements");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await connectDB();
  await Announcement.findByIdAndDelete(id);
  revalidatePath("/announcements");
  return { success: true };
}

export async function updateTournamentSettings(data: {
  registrationOpen?: boolean;
  registrationDeadline?: Date;
  registrationFee?: number;
  tournamentName?: string;
  tournamentTagline?: string;
}) {
  await requireAdmin();
  await saveTournamentSettings(data);
  revalidatePath("/");
  revalidatePath("/register");
  return { success: true };
}

export async function exportPlayersCSV(): Promise<string> {
  await requireAdmin();
  await connectDB();
  const { Payment } = await import("@/models/Payment");
  const players = await Player.find().sort({ createdAt: -1 }).lean();
  const payments = await Payment.find().lean();
  const paymentMap = new Map(payments.map((p) => [p.playerId, p]));

  const headers = [
    "Registration Number",
    "Full Name",
    "Email",
    "Phone",
    "Category",
    "Group",
    "Status",
    "Payment Status",
    "Reference",
    "Amount",
    "Registered At",
  ];

  const rows = players.map((p) => {
    const payment = paymentMap.get(String(p._id));
    return [
      p.registrationNumber,
      p.fullName,
      p.email,
      p.phone,
      p.category,
      p.group ?? "N/A",
      p.status,
      p.paymentStatus,
      p.paystackReference ?? "",
      p.registrationFee,
      p.createdAt.toISOString(),
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
