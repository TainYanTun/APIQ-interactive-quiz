import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionData = await getSession();

  if (!sessionData) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json(sessionData);
}
