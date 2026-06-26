import { NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/waitlist";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };

    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    await addToWaitlist(body.email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
