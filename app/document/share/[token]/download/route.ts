import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const share = await prisma.shareLink.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      document: {
        select: {
          name: true,
          mimeType: true,
          data: true,
        },
      },
    },
  });

  if (!share || !share.document || !share.document.data) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return new NextResponse("Link expired", { status: 410 });
  }

  const fileBuffer = share.document.data;

  return new NextResponse(fileBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": share.document.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(share.document.name)}"`,
    },
  });
}
