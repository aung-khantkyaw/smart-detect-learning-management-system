import { db } from '../db';
import { academicChatRooms, chatMembers, courseChatRooms } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { setCache } from './redisClient';

export async function warmInitialCaches() {
  const start = Date.now();
  try {
    const [academicRooms, courseRooms] = await Promise.all([
      db.select().from(academicChatRooms),
      db.select().from(courseChatRooms)
    ]);

    const academicWithMembers = await Promise.all(academicRooms.map(async (room: any) => {
      const members = await db.select().from(chatMembers).where(
        and(eq(chatMembers.roomId, room.id), eq(chatMembers.roomType, 'ACADEMIC'))
      );
      return { ...room, members, membersCount: members.length };
    }));

    const courseWithMembers = await Promise.all(courseRooms.map(async (room: any) => {
      const members = await db.select().from(chatMembers).where(
        and(eq(chatMembers.roomId, room.id), eq(chatMembers.roomType, 'COURSE'))
      );
      return { ...room, members, membersCount: members.length };
    }));

    await Promise.all([
      setCache('chatrooms:academic:withMembers', academicWithMembers, 120),
      setCache('chatrooms:course:withMembers', courseWithMembers, 120)
    ]);

    console.log(`🔥 Cache warm complete in ${Date.now() - start}ms (academic: ${academicWithMembers.length}, course: ${courseWithMembers.length})`);
  } catch (e) {
    console.error('Cache warming failed:', e);
  }
}
