import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function pushNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  });
}
