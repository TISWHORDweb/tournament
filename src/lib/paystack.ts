const PAYSTACK_BASE = "https://api.paystack.co";

export async function initializePaystackPayment(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callbackUrl: string;
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack secret key not configured");

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      currency: "NGN",
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initialize payment");
  }
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyPaystackPayment(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack secret key not configured");

  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to verify payment");
  }
  return data.data as {
    status: string;
    reference: string;
    amount: number;
    channel: string;
    paid_at: string;
  };
}

export function generatePaymentReference(): string {
  return `TTC-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function getRegistrationFee(): number {
  return Number(process.env.REGISTRATION_FEE || 150000);
}
