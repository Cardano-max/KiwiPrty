import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { notify } from "@/server/services/notifications";
import { parseList } from "@/server/mappers";
import { formatPaise } from "@/domain/money";

// Daily supplier report. Trigger from an external scheduler (cron / GitHub
// Action / Vercel Cron) with header `x-cron-secret: $CRON_SECRET`. Sends each
// approved supplier a summary of the last 24h (in-app + WhatsApp when configured).
// Disabled unless CRON_SECRET is set.
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const suppliers = await prisma.supplierProfile.findMany({ where: { kycStatus: "approved" } });

  let sent = 0;
  for (const s of suppliers) {
    const [orders, inquiries] = await Promise.all([
      prisma.supplierOrder.findMany({ where: { supplierId: s.id, createdAt: { gte: since } } }),
      prisma.inquiry.count({ where: { supplierId: s.id, createdAt: { gte: since } } }),
    ]);
    const sales = orders.reduce((a, o) => a + o.totalPaise, 0);
    const body = `Last 24h: ${orders.length} order(s) (${formatPaise(sales)}), ${inquiries} inquiry(ies).`;
    await notify(s.userId, {
      type: "system",
      title: "📊 Your daily report",
      body,
      link: "/supplier/analytics",
      phone: parseList(s.mobiles)[0],
      viaWhatsApp: true,
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, suppliersNotified: sent });
}
