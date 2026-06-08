import { prisma } from "@/server/db";
import { sendWhatsAppText } from "@/server/integrations/whatsapp";

export interface NotifyInput {
  type: "order" | "inquiry" | "system" | "payment";
  title: string;
  body?: string;
  link?: string;
  phone?: string;
  viaWhatsApp?: boolean;
}

/** Record an in-app notification and dispatch to WhatsApp when configured. */
export async function notify(userId: string, n: NotifyInput) {
  await prisma.notification.create({
    data: { userId, type: n.type, title: n.title, body: n.body, link: n.link },
  });
  if (n.viaWhatsApp && n.phone) {
    void sendWhatsAppText(n.phone, `${n.title}${n.body ? `\n${n.body}` : ""}`).catch(() => {});
  }
}

export async function listNotifications(userId: string, take = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}
