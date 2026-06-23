"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Player } from "@/models/Player";
import { Payment } from "@/models/Payment";
import { generateRegistrationNumber } from "@/lib/constants";
import {
  generatePaymentReference,
  getRegistrationFee,
  initializePaystackPayment,
  verifyPaystackPayment,
} from "@/lib/paystack";
import {
  approvePlayerAfterPayment,
  getPlayerByRegistrationNumber,
  getTournamentSettings,
  isSlotAvailableFor,
  getSlotCount,
} from "@/lib/tournament";
import { StackCategory, TeamGroup } from "@/lib/types";

export type RegistrationFormData = {
  fullName: string;
  phone: string;
  email: string;
  slackUsername?: string;
  discordUsername?: string;
  category: StackCategory;
  group?: TeamGroup | null;
};

export async function getRegistrationAvailability() {
  const settings = await getTournamentSettings();
  const categories: StackCategory[] = ["BACKEND", "FRONTEND", "MOBILE", "UI_UX", "RESERVE"];

  const availability = await Promise.all(
    categories.map(async (category) => {
      if (category === "RESERVE") {
        const count = await getSlotCount("RESERVE", null);
        const available = await isSlotAvailableFor("RESERVE", null);
        return { category, group: null, count, available, remaining: 10 - count };
      }
      const groups = await Promise.all(
        (["A", "B"] as TeamGroup[]).map(async (group) => {
          const count = await getSlotCount(category, group);
          const available = await isSlotAvailableFor(category, group);
          return { group, count, available, remaining: 9 - count };
        })
      );
      return { category, groups };
    })
  );

  return { settings, availability };
}

export async function createRegistration(data: RegistrationFormData) {
  await connectDB();
  const settings = await getTournamentSettings();

  if (!settings.registrationOpen) {
    return { success: false, error: "Registration is currently closed." };
  }

  if (new Date() > settings.registrationDeadline) {
    return { success: false, error: "Registration deadline has passed." };
  }

  const group = data.category === "RESERVE" ? null : data.group ?? null;

  if (data.category !== "RESERVE" && !group) {
    return { success: false, error: "Please select a group." };
  }

  const available = await isSlotAvailableFor(data.category, group);
  if (!available) {
    return { success: false, error: "Selected slot is no longer available." };
  }

  const existing = await Player.findOne({ email: data.email.trim().toLowerCase() });
  if (existing && existing.paymentStatus === "PAID") {
    return { success: false, error: "This email is already registered." };
  }

  const fee = settings.registrationFee || getRegistrationFee();
  const reference = generatePaymentReference();
  let registrationNumber = generateRegistrationNumber();

  while (await Player.findOne({ registrationNumber })) {
    registrationNumber = generateRegistrationNumber();
  }

  const playerData = {
    registrationNumber,
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    slackUsername: data.slackUsername?.trim() || null,
    discordUsername: data.discordUsername?.trim() || null,
    category: data.category,
    group,
    registrationFee: fee,
    paystackReference: reference,
    paymentStatus: "PENDING" as const,
    status: "PENDING" as const,
  };

  let player;
  if (existing) {
    player = await Player.findByIdAndUpdate(existing._id, playerData, { new: true });
    const existingPayment = await Payment.findOne({ playerId: existing._id.toString() });
    if (existingPayment) {
      await Payment.findByIdAndUpdate(existingPayment._id, {
        reference,
        amount: fee,
        status: "PENDING",
        paidAt: null,
      });
    } else {
      await Payment.create({
        playerId: existing._id.toString(),
        reference,
        amount: fee,
        status: "PENDING",
      });
    }
  } else {
    player = await Player.create(playerData);
    await Payment.create({
      playerId: player._id.toString(),
      reference,
      amount: fee,
      status: "PENDING",
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${appUrl}/register/verify?reference=${reference}`;

  try {
    const payment = await initializePaystackPayment({
      email: player.email,
      amount: fee,
      reference,
      callbackUrl,
      metadata: {
        playerId: player._id.toString(),
        registrationNumber: player.registrationNumber,
        category: player.category,
        group: player.group,
      },
    });

    return {
      success: true,
      paymentUrl: payment.authorization_url,
      reference,
      playerId: player._id.toString(),
      registrationNumber: player.registrationNumber,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment initialization failed.",
    };
  }
}

export async function verifyRegistrationPayment(reference: string) {
  try {
    const verification = await verifyPaystackPayment(reference);
    if (verification.status !== "success") {
      return { success: false, error: "Payment was not successful." };
    }

    await connectDB();
    const player = await Player.findOne({ paystackReference: reference });
    if (!player) {
      return { success: false, error: "Registration not found." };
    }

    if (player.paymentStatus === "PAID") {
      return { success: true, player, alreadyPaid: true };
    }

    const available = await isSlotAvailableFor(player.category, player.group ?? null);
    if (!available) {
      await Player.findByIdAndUpdate(player._id, {
        paymentStatus: "FAILED",
        status: "REMOVED",
      });
      return {
        success: false,
        error: "Payment received but slot is no longer available. Contact organizers for refund.",
      };
    }

    const updated = await approvePlayerAfterPayment(player._id.toString(), reference);

    await Payment.findOneAndUpdate(
      { playerId: player._id.toString() },
      {
        channel: verification.channel,
        paidAt: verification.paid_at ? new Date(verification.paid_at) : new Date(),
      }
    );

    revalidatePath("/");
    revalidatePath("/teams");
    revalidatePath("/admin/dashboard");

    return { success: true, player: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed.",
    };
  }
}

export async function getPlayerConfirmation(registrationNumber: string) {
  return getPlayerByRegistrationNumber(registrationNumber);
}
