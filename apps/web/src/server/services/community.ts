import { prisma } from "@/server/db";
import { notify } from "@/server/services/notifications";

// --- feature requests ---

export async function createFeatureRequest(userId: string, title: string, detail?: string) {
  return prisma.featureRequest.create({
    data: { submittedById: userId, title, detail: detail || null },
  });
}

export async function listFeatureRequests() {
  return prisma.featureRequest.findMany({
    orderBy: [{ votes: "desc" }, { createdAt: "desc" }],
    include: { submittedBy: true },
  });
}

export async function voteFeatureRequest(id: string) {
  await prisma.featureRequest.update({ where: { id }, data: { votes: { increment: 1 } } });
}

export async function setFeatureStatus(id: string, status: string) {
  if (!["open", "planned", "done", "declined"].includes(status)) throw new Error("Invalid status");
  await prisma.featureRequest.update({ where: { id }, data: { status } });
}

// --- disputes ---

export async function createDispute(
  userId: string,
  input: { orderId?: string; subject: string; message: string },
) {
  return prisma.disputeTicket.create({
    data: { raisedById: userId, orderId: input.orderId || null, subject: input.subject, message: input.message },
  });
}

export async function listUserDisputes(userId: string) {
  return prisma.disputeTicket.findMany({ where: { raisedById: userId }, orderBy: { createdAt: "desc" } });
}

export async function listAllDisputes() {
  return prisma.disputeTicket.findMany({ orderBy: { createdAt: "desc" }, include: { raisedBy: true } });
}

export async function resolveDispute(id: string, response: string, status: string) {
  if (!["open", "in_review", "resolved", "closed"].includes(status)) throw new Error("Invalid status");
  const d = await prisma.disputeTicket.update({
    where: { id },
    data: { response: response || null, status },
  });
  await notify(d.raisedById, {
    type: "system",
    title: `Support ticket ${status}`,
    body: response || `Your ticket “${d.subject}” is now ${status}.`,
    link: "/disputes",
  });
  return d;
}
