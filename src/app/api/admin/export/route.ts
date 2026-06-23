import { NextResponse } from "next/server";
import { exportPlayersCSV } from "@/actions/admin";

export async function GET() {
  try {
    const csv = await exportPlayersCSV();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tournament-export.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
