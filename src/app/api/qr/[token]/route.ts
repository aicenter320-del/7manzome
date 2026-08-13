import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { env } from "@/shared/config/env";
import { giftTokenSchema } from "@/shared/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const parsed = giftTokenSchema.safeParse(token);

  if (!parsed.success) {
    return new NextResponse("لینک هدیه معتبر نیست.", { status: 400 });
  }

  const url = `${env.APP_URL.replace(/\/+$/, "")}/g/${parsed.data}`;
  const png = await QRCode.toBuffer(url, { type: "png", width: 512, margin: 2 });

  return new NextResponse(Uint8Array.from(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
