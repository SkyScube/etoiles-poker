import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export async function DelRoom(roomId: string): Promise<boolean> {
    try {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return false;
        }
        await prisma.room.delete({ where: { id: roomId } });
        return true;
    } catch {
        return false;
    }
}