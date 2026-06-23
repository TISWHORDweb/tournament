import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllPlayersForAdmin } from "@/lib/tournament";
import { STACK_LABELS } from "@/lib/constants";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const players = await getAllPlayersForAdmin();

  const rows = players.map((p) => ({
    "Registration Number": p.registrationNumber,
    "Full Name": p.fullName,
    Email: p.email,
    Phone: p.phone,
    Category: STACK_LABELS[p.category],
    Group: p.group ?? "N/A",
    Status: p.status,
    "Payment Status": p.paymentStatus,
    Reference: p.paystackReference ?? "",
    Amount: p.registrationFee / 100,
    "Registered At": p.createdAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Players");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tournament-export.xlsx"`,
    },
  });
}
