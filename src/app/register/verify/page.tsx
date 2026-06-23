import { redirect } from "next/navigation";
import { verifyRegistrationPayment } from "@/actions/registration";

export const dynamic = "force-dynamic";

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  if (!reference) {
    redirect("/register?error=missing-reference");
  }

  const result = await verifyRegistrationPayment(reference);

  if (result.success && result.player) {
    redirect(`/confirmation/${result.player.registrationNumber}`);
  }

  redirect(`/register?error=${encodeURIComponent(result.error || "verification-failed")}`);
}
